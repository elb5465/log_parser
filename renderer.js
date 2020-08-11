// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { dialog } = require('electron').remote;
var fs = require('fs');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const { exec } = require("child_process");
var fs = require('fs');
const path = require( "path" );
var express = require('express');
var app = express();

var execute = function(command, callback){
  exec(command, {maxBuffer: 1024 * 1000}, function(error, stdout, stderr){ callback(error, stdout); });
};
var file = "";


//--------------- CODE FOR A WORKING FILE DIALOG PROMPT -----------------
function selectFile(instr="write"){

  if (instr=="read"){
    dialog.showOpenDialog({properties: ['openFile']}, 
      function (path) {
        //see file name in console
        console.log(path);
        //save info to a div and var if needed
        file = path; 
        document.getElementById("filePath").value = file;
        read_log_file(file);
      }
    );
  }

  else {
    dialog.showOpenDialog({properties: ['openDirectory']}, 
    function (dir) {
      //see file name in console
      console.log(dir);
      document.getElementById("jsonDir").value = dir;
    }
    );
  }
}
//-------------------------------------------------------------------------




//------------ READ FILES -----------
function read_log_file(file){
  abs_path = path.resolve("/", String(file));
  // console.log(abs_path);
  // console.log(file);
  console.log(file)
  if (file==undefined){
    document.getElementById("log_contents").innerHTML = "Couldn't open file.";
    return;
  }

  if (file!="" && isValid_FileExtension(file)){
      fs.readFile(abs_path, 'utf8', function(err, data) {
          if (err) throw err;
          // console.log(data);
          document.getElementById("log_contents").innerHTML = data;
          return;
      });                    
  }
  document.getElementById("log_contents").innerHTML = "Couldn't open file.";
}



function read_json_file(json){
  abs_path = path.resolve("/", String(json)+"\\"+"results.json");
  console.log("ABSOLUTE PATH(read_json_file)" + abs_path)

  if (json==undefined){ document.getElementById("json_contents").innerHTML = "Couldn't open file \'" + file + "\'.";}
  
  else if (json!="" && isValid_FileExtension(json)){
      fs.readFile(abs_path, 'utf8', function(err, data) {
          if (err) throw err;
          // console.log(data);
          document.getElementById("json_contents").innerHTML = data;
      });                    
  }

  else{
    document.getElementById("json_contents").innerHTML = "Couldn't open file \'" + json + "\'.";
  }
}

//-------------------------------------------------------------------------


//--------------- CODE TO INCLUDE JSON IN OUTPUT ---------------------
function createJSON(){
  var selected_path_for_JSON = '';
  var json_checked = document.getElementById("checkbox").checked;
  
  if (json_checked)  { 
    selectFile("write");
  }

  //tk do similar to select_file section - 
  //    include a box that displays the folder selected when the checkbox is checked..
  
}
//-------------------------------------------------------------------------

//----------------- TKTKTKTK PROMPT A FILE DIALOG WHEN CLICK PARSING IF JSON CHECK BOX CHECKED ----------
// if json checked, 
//  prompt file dialog
//  save file path
//  pass file path into python script execution as an argument
//  do a try/except or something similar to try reading the file until it is available
//    read the json into the json contents tab



//---------------- CODE TO INITIATE SCRIPT RUNNING ON BUTTON CLICK ----------------
// -------------------------------------------------------------------------------------- TK - Implement a save dialog to allow user to save JSON somewhere other than inside the app dir

function call_PyScript(){  
    var res = document.getElementById('results_contents').value;
    var json_checked = document.getElementById("checkbox").checked;
    var log = document.getElementById('filePath').value;
    var json_path = document.getElementById('jsonDir').value;
    

    if (log==undefined || json_path==undefined || file=="")  { return;}

    if (json_checked){
      console.log("SELECTED DOWNLOAD PATH: " + json_path);
      log += " json ";
      log += json_path+"\\"+"results.json";  
    }


    execute("python parsing_folder/log_parser.py " + log, (error, stdout, stderr) => {
      document.getElementById('results_contents').innerHTML = "";
      if (error) {
          console.log(`error: ${error.message}`);
          document.getElementById('results_contents').value = `error: ${error.message}`;
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          document.getElementById('results_contents').value = `stderr: ${stderr}`;
          return;
      }

      // if no errors, save the output from the python script, then parse it.
      list_of_lines = stdout.split("\n");
      parse_output(list_of_lines);
      // console.log(stdout);
    });

  }



//---------------- CODE TO PARSE SCRIPT RESULTS AND ORGANIZE INTO TABS ----------------
function parse_output(list_of_lines){
  var start_collecting_summary = false;
  var json_checked = document.getElementById("checkbox").checked;

  indent = 0

  for (i=0; i < list_of_lines.length; i++){
    var line = list_of_lines[i].trim();
    line = line.replace(/\'/g, "");
    console.log(line)

    if (line == "$$__SUMMARY__$$"){
      document.getElementById('summary_contents').innerHTML = "";
      start_collecting_summary = true;
      continue;
    }

    if (start_collecting_summary){
      // using regex expression to rmv apostrophes left by pythons indenting tabs, '\t'
      document.getElementById('summary_contents').innerHTML += line + '\n';
    } 
    else{
      document.getElementById('results_contents').innerHTML += line + '\n';
    }
    

    
  }

  //tk read the json that is outputted and store in json_contents
  if (json_checked)  { 
    var dir = document.getElementById('jsonDir').value;
    read_json_file(dir);
  }
  // document.getElementById('results_contents').value = `stdout: ${stdout}`;
  // document.getElementById('results_contents').innerHTML = `stdout: ${stdout}`;

}



//--------------- CLICK LISTENER FOR TABS ----------------------------------
prev_tab = "";
document.addEventListener('click', ({ target }) => {

  if (!target.closest('.tablinks') && !target.closest('.tabcontent')) {
    // reset the tabs when clicking away
    tabcontent = document.getElementsByClassName("tabcontent");
    prev_tab = "";
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  }
});



//---------------- FUNCTIONALITY OF TABS CHANGING --------------
function openTab(evt, tab) {
  var i, tabcontent, tablinks;

  // Don't redo actions if tab clicked more than once..
  if (prev_tab!=tab){
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
    document.getElementById(tab).style.display = "block";
    evt.currentTarget.className += " active";
  }

  prev_tab = tab;
}
//-------------------------------------------------------------------------





//---------------- CODE TO CLEAR ALL THE FIELDS SO USER CAN RESTART --------------
function clearSelections(all=0){
  document.getElementById('innerBtn').disabled = false;
  file = "";
  document.getElementById("filePath").value = "";
  document.getElementById("checkbox").checked = false;


  //only reset the responses when specified..
  if (all==0){
    document.getElementById("results_contents").value = "Click \"Start Parsing\" to display results";
    document.getElementById("log_contents").innerHTML = "Select a file above to view its contents here";
    document.getElementById('summary_contents').innerHTML =  "Click \"Start Parsing\" to display results";
    document.getElementById('json_contents').innerHTML =  "Select the JSON checkbox and click \"Start Parsing\" to display results";

  }
} 
//-------------------------------------------------------------------------



//=================== MISCELLANEOUS HELPER FUNCTIONS ======================

function isValid_FileExtension(file_arr){
  var valid_extensions = ['txt', '', 'json'];

  var path = file_arr[0];
  var split_path = path.split("\\");

  file = split_path.pop();
  
  split_file = file.split(".");

  if (split_file.length == 2)
      {
      file_name = split_file[0];
      file_extension = split_file[1];


      if ( valid_extensions.includes(file_extension) ) 
          {   
          return true
          }

      document.getElementById("log_contents").innerHTML = "Invalid file selected."
      return false
      }

  if (split_file.length == 1){
      return true;
  }
  
  document.getElementById("log_contents").innerHTML = "Invalid file selected."
  return false;
}

//-----------------------------------------------





//=========================================================================

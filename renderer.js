// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { dialog } = require('electron').remote;
var fs = require('fs');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const { exec } = require("child_process");
var fs = require('fs');
var execute = function(command, callback){
  exec(command, {maxBuffer: 1024 * 1000}, function(error, stdout, stderr){ callback(error, stdout); });
};
var file = "";


//--------------- CODE FOR A WORKING FILE DIALOG PROMPT -----------------
function selectFile(){
    dialog.showOpenDialog({properties: ['openFile']}, 
      function (path) {
          //see file name in console
          console.log(path);
          //save info to a div and var if needed
          file = path; 
          document.getElementById("filePath").value = file;
      }
    );
}
//-------------------------------------------------------------------------




//--------------- CODE TO INCLUDE JSON IN OUTPUT ---------------------
function createJSON(){
  var checkbox = document.getElementById("checkbox");
  var json_div = document.getElementById("json_div");
  var border = document.getElementById("border");
  json = checkbox.checked;

  // console.log(pubkey_div.style['display']);

  if (checkbox.checked){
    json_div.style['display'] = 'block';
    // border.style['display'] = 'block';
  }
  else{
    document.getElementById("json_results").value = "";
    json_div.style['display'] = 'none';
    border.style['display'] = 'none';
  }
}
//-------------------------------------------------------------------------





//---------------- CODE TO INITIATE SCRIPT RUNNING ON BUTTON CLICK ----------------
function call_PyScript(){  
    var res = document.getElementById('results_contents').value;
    log = document.getElementById("filePath").value;
    start_collecting_summary = false;
    start_collecting_json = false;
    

    if (log == "undefined"){
      file = "";
    }

    if (document.getElementById("checkbox").checked){
      log += " json";
    }

    execute("python parsing_folder/log_parser.py " + log, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          document.getElementById('results_contents').value = `error: ${error.message}`;
          // if (error.message.contains())
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          document.getElementById('results_contents').value = `stderr: ${stderr}`;
          return;
      }

      list_of_lines = stdout.split("\n");

      for (i=0; i < list_of_lines.length; i++){
        line = list_of_lines[i].trim();

        if (line == "LOG RESULTS SUMMARY:"){
          start_collecting_summary = true;
        }
        console.log(`line: ${line}`);
        // document.getElementById('summary_contents').innerHTML += list_of_lines[i] + "<br>";

        
      }

      document.getElementById('results_contents').value = `stdout: ${stdout}`;
      document.getElementById('results_contents').innerHTML = `stdout: ${stdout}`;

    });

}
//-------------------------------------------------------------------------


document.addEventListener('click', ({ target }) => {
  if (!target.closest('.tablinks')) {
    console.log('click outside')
    // reset the tabs when clicking away
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
  }
})



//---------------- FUNCTIONALITY OF TABS CHANGING --------------
function openTab(evt, tab) {
  var i, tabcontent, tablinks;
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

  if (tab=="test_log"){
    if (file!=""){
        fs.readFile(file[0], 'utf8', function(err, data) {
            if (err) throw err;
            console.log(data);
            document.getElementById("log_contents").innerHTML = data;
        });                    
    }
  }
}
//-------------------------------------------------------------------------





//---------------- CODE TO CLEAR ALL THE FIELDS SO USER CAN RESTART --------------
function clearSelections(all=0){
  document.getElementById('innerBtn').disabled = false;

  file = "";
  document.getElementById("filePath").value = "";
  document.getElementById("checkbox").checked = false;


  //only reset the responses when specified
  if (all==0){
    document.getElementById("results_contents").value = "";
    document.getElementById("log_contents").innerHTML = "Select a file above to view its contents here";
  }
} 
//-------------------------------------------------------------------------


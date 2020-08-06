// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { dialog } = require('electron').remote;
var fs = require('fs');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const { exec } = require("child_process");


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



//---------------- CODE TO INITIATE SCRIPT RUNNING ON BUTTON CLICK ----------------
function call_PyScript(){  

    var res = document.getElementById('results');
    file = document.getElementById("filePath").value;

    console.log(`${file}`);

    if (file == "undefined"){
      file = "";
    }

    //TK - Make code in py script to take argument of a particular file path, 
    //     and have it default to doing all the files in the current directory if none are given
    // exec("python M0_log_parser.py" + file, (error, stdout, stderr) => {
    exec("python log_parser.py " + file, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
  });
  // }


    // TK - Do work here to call python script
}
//-------------------------------------------------------------------------




//---------------- CODE TO CLEAR ALL THE FIELDS SO USER CAN RESTART --------------
function clearSelections(all=0){
  document.getElementById('innerBtn').disabled = false;

  file = "";
  document.getElementById("filePath").value = "";

  //only reset the responses when specified
  if (all==0){
    document.getElementById("results").value = "";
  }
} 
//-------------------------------------------------------------------------


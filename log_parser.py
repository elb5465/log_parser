"""
@script M0_log_parser.py

This script searches through the logged outputs of the VersiCharge tests and determines
the status of a test - Whether it was successful or not, returning a dictionary of the files, 
each with their corresponding tests/results in a nested dictionary.
"""

import glob
import os
import sys
import json

# class Directory_obj:
#     def __init__(self, name):
#         self.name = name
#         self.contents = contents
#         self.files = []

# class File_obj(Directory_obj):
#     def __init__(self, name, tests):
#         super().__init__(name)
#         self.tests = tests
    
# class Test_obj(Directory_obj):
#     def __init__(self, name, status):
#         super().__init__(name)
#         self.status = status


pos = ["passed", "success", "available", "preparing", "charging", "sysvarh(-)", "level"]
neg = ["failed", "faulted", "fault", "autoretry", "bad", "panic"]

#---------------------------------------------------------------------------
def fix_name(name):
    """ Standardizes file/directory names so there are no spaces in them, reducing likelihood of errors when parsing or calling scripts. """
    # TK - ask Sesha about renaming files before I go ahead and do that.

    # if ' ' in name:
    #     new_name = name.replace(' ', '_')
    #     os.rename(r'{}'.format(name), r'{}'.format(new_name))
    #     name = new_name
    return name


#---------------------------------------------------------------------------
def clean_list(list_of_lines):
    """ Remove any of the entries that are not needed in the list of lines from the test-response. """
    junk = ["STF>", ""]
    list_of_lines = list(filter(lambda x: x not in junk, list_of_lines))
    list_of_lines = [line.replace("STF>", "") for line in list_of_lines]

    return list_of_lines


#---------------------------------------------------------------------------
def bold_print(a_string):
    print("---------------------------------------------------")
    print(a_string)
    print("---------------------------------------------------\n")

def sharp_print(a_string):
    print("____________________________________________________")
    print(a_string)
    print("____________________________________________________\n")

def hint_print(line):
    n_line = line.lower().replace("stf>", "")
    for x in pos:
        if (x in n_line) and ("sysvar" not in x):
            print("(+) ", line)
    for y in neg:
        if y in n_line:
            print("(-) ", line)


#---------------------------------------------------------------------------
def get_test_status(list_of_lines):
    first_line = list_of_lines[0].lower()
    last_line  = list_of_lines[-1].lower()
    second_to_last = list_of_lines[-2].lower()

    #check last line of every test-grouping first
    for word in neg:
        if (word in last_line) or (word in second_to_last):
            return {"failed" : list_of_lines}
    for word in pos:
        if ("phase" in first_line):
            return {"failed" : list_of_lines}
        if (word in last_line):
            return {"passed" : list_of_lines}
    else:
        return {"error":"test didn't pass or fail"}


#---------------------------------------------------------------------------
def split_results_after(a_string, a_file):
    """ Saves a line specified by "a_string" and all following lines until the next occurrence of "a_string". """
    big_string = ""
    collect = False
    tests = {}
    list_of_lines = []
    outcomes = ["passed", "success", "failed", "faulted", "fault"]
    is_On = False
    set = False
    prev = ""

    i = 0
    for line in a_file:
        # n_line: normalized line (lower case and without extra things)
        n_line = line.lower().replace("stf>", "")
        line = line.replace("STF>", "")
        if "versichargesg" in n_line:
            bold_print(line.replace("** Diagnostics - ", ""))
        if "version match" in n_line:
            continue


        #collect all the lines after "a_string" or the "power on"
        if collect and (a_string not in n_line):
            big_string += line

        elif (a_string in n_line) or ("power on" in n_line):
            if len(big_string):
                big_string += line
                list_of_lines = clean_list(big_string.split("\n"))
                tests["Test_"+str(i)] = get_test_status(list_of_lines)
                set = True

            big_string = ""
            collect = True
            i += 1

        else:
            pass
        


        if "power on" in n_line:
            sharp_print(line)
            is_On = True
        elif is_On:
            if prev != "Test_"+str(i):
                bold_print("Test_"+str(i))
            prev = "Test_"+str(i)
            hint_print(line)
        else:
            continue



    if len(big_string):
        big_string += line
        list_of_lines = clean_list(big_string.split("\n"))
        tests["Test_"+str(i)] = get_test_status(list_of_lines)
        set = True
    if is_On:
        for x in outcomes:
            if x in n_line:
                if prev != "Test_"+str(i):
                    bold_print("Test_"+str(i))
                    prev = "Test_"+str(i)
                    print("", line)
    return tests


#---------------------------------------------------------------------------
def check_file_output(file_path):
    """ Opens a file at "file_path" and reads the results in a section specified by a string, then returns the results found in that file. """
    f = open(file_path, "r")
    results = split_results_after("sysvarh(-)", f)

    f.close()

    return results



#---------------------------------------------------------------------------
def valid_extension(file_path):
    ''' Returns True if the file's extension is in the list 'valid_extensions' below. '''
    valid_extensions = ["", ".txt"]

    ext = os.path.splitext(file_path)[1]
    if ext in valid_extensions:
        return True

    return False



#---------------------------------------------------------------------------
def get_file_tree():
    """ Go through current directory and all subdirectories, printing out their names and the file names within each. """
    
    tree = {}
    file_list = []
    file_tests = {}


    for root, dirs, files in os.walk("./parsing_folder"): 
        # print("ROOT: ", root)
        # print("DIRS: ", dirs)
        # print("FILES: ", files)

        # Not looking to parse the git directory, so skip it and skip blank dirs.
        # if (".git" in root) or (len(files) == 0): #tk - use this line to check all dirs
        if (".git" in root) or (len(files) == 0):
            continue

        root = fix_name(root)

        for f in files:
            file_path = os.path.join(root, f)
            file_path = fix_name(file_path)

            #only check results for certain file extensions (or could do it by name like checking for "AC10A04026262" in the filename)
            if not valid_extension(file_path):
                continue

            if (os.path.isfile(file_path)):
                file_tests[file_path] = check_file_output(file_path)
                file_list.append(file_tests)
                file_tests = {}
            break #TK - Just test on one file to start

        if len(file_list)!=0:
            tree[root] = file_list

        else: 
            print('\'{}\' has no files with valid extensions.'.format(root))
        file_list = []

    return tree



#---------------------------------------------------------------------------
def dict_to_JSON(a_dict, print_or_output):
    """Takes a dict, sorts it and formats it like a JSON. Then, it prints it out in the console and sends the same
    result to a new JSON file in the directory that this tool is run, unless --noJSON is specified as an argument."""
    # print("-------------------------------------------------------------------------")
    # print("{\n\tDirectory_name: [")
    # print("\t\tFile_name: {")
    # print("\t\t\tTest:    {")
    # print("\t\t\t\tResults ")
    # print("\t\t\t\t }")
    # print("\t\t\t} ")
    # print("\t\t]")
    # print("} ")
    # print("-------------------------------------------------------------------------")

    formatted_json_log_results = json.dumps(a_dict, indent = 8, sort_keys=True)

    # use this to print json to console
    if print_or_output == "print":
        print(formatted_json_log_results) 
    
    # Write results to a JSON file
    if print_or_output == "output":
        log_results = open("./parsing_folder/log_results.json", "w+")
        log_results.write(formatted_json_log_results)
        log_results.close()

    # Write results to a txt file with JSON styling
    # log_results = open("log_results.txt", "w+")
    # log_results.write(formatted_json_log_results)
    # log_results.close()


#---------------------------------------------------------------------------
def main():
    args_list = sys.argv
    file_id = ""
    # print(len(args_list))
    tree = {}


    if (len(args_list)>=2 and args_list[1]!="json"):
        file_id = args_list[1]
        file = check_file_output(file_id)
        tree[file_id] = file

        sharp_print("LOG RESULTS: \n" + file_id)

        if len(args_list)==3:
            if args_list[2]=="json":
                dict_to_JSON(tree, "output")

        for test, contents in file.items():
            print("\t", test, end="")
            for status, info in contents.items():
                if status!="passed":
                    status = "[ " + status + " ]"
                    print("   -----> ", status.upper())
                    for i in info:
                        print("\t\t\t ", i)
                    print("")
                else:
                    print("   -----> ", status.upper())


    elif (len(args_list)>=1):
        tree = get_file_tree()
        # output the results to a json if specified in args
        if (len(args_list)>1 and args_list[1]=="json"):
            dict_to_JSON(tree, "output")

        sharp_print("LOG RESULTS SUMMARY: ")
        for directory_id, files in tree.items():
            print("directory_id: ", directory_id)

            for file in files:

                for file_id, contents in file.items():
                    print("\tfile_id: ", file_id) 

                    for test, info in contents.items():
                        print("\t\t", test, end="")
                        
                        for test_status, test_details in info.items():
                            #highlight failed tests
                            if test_status!="passed":
                                test_status = "[ " + test_status + " ]"
                                print("   -----> ", test_status.upper())
                                
                                for i in test_details:
                                    print("\t\t\t ", i)
                                print("")

                            else:
                                print("   -----> ", test_status.upper())
        return 


    
    else:
        print("Python Script Error: Didn't catch something...")



#---------------------------------------------------------------------------
if __name__ == "__main__":
    main()

        
           

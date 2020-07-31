"""
@script M0_log_parser.py

This script searches through the logged outputs of the VersiCharge tests and determines
the status of a test - Whether it was successful or not, returning a dictionary of the files, 
each with their corresponding tests/results in a nested dictionary.
"""

import glob
import os
import json


#---------------------------------------------------------------------------
def fix_name(name):
    """ Standardizes file/directory names so there are no spaces in them, reducing likelihood of errors when parsing. """
    if ' ' in name:
        new_name = name.replace(' ', '_')
        os.rename(r'{}'.format(name), r'{}'.format(new_name))
        name = new_name
    return name


#---------------------------------------------------------------------------
def clean_list(list_of_lines):
    """ Remove any of the entries that are not needed in the list of lines from the test-response. """
    junk = ["STF>", ""]
    list_of_lines = list(filter(lambda x: x not in junk, list_of_lines))

    return list_of_lines


# #---------------------------------------------------------------------------
# def split_results_after(a_string, a_file):
#     """ Saves a line specified by "a_string" and all following lines until the next occurrence of "a_string". """
#     big_string = ""
#     collect = False
#     start_sec = False
#     tests = {}
#     list_of_lines = []

#     i = 0
#     for line in a_file:
#         # initial case of crossing "a_string" or the beginning version info..
#         if collect==False and ((a_string in line.lower()) or ("power on" in line.lower())):
#             big_string += line
#             collect = True
#             start_sec = True

#         # save all lines following "a_string" ..
#         elif collect and ((a_string not in line.lower()) and ("power on" not in line.lower())):
#             big_string += line
#             # for line in list_of_lines:
#                 # print(line)
#             # print("-------------------------------")

#         # stop collecting lines for that test and restart..
#         elif collect and (a_string in line.lower()):
#             collect = False
#             i +=1
#             list_of_lines = big_string.split("\n")
#             tests["Test_"+str(i)] = clean_list(list_of_lines)
#             big_string = ""
#             list_of_lines = []

#         else: 
#             print(list_of_lines)
#             pass

#     return tests


#---------------------------------------------------------------------------
def split_results_after(a_string, a_file):
    """ Saves a line specified by "a_string" and all following lines until the next occurrence of "a_string". """
    big_string = ""
    collect = False
    start_sec = False
    tests = {}
    list_of_lines = []

    i = 0
    for line in a_file:
        # initial case of crossing "a_string" or the beginning version info..
        if collect==False and ((a_string in line.lower()) or ("power on" in line.lower())):
            big_string += line
            collect = True
            start_sec = True

        # save all lines following "a_string" ..
        elif collect and ((a_string not in line.lower()) and ("power on" not in line.lower())):
            big_string += line
            # for line in list_of_lines:
                # print(line)
            # print("-------------------------------")

        # stop collecting lines for that test and restart..
        elif collect and (a_string in line.lower()):
            collect = False
            i +=1
            list_of_lines = big_string.split("\n")
            # tests["Test_"+str(i)] = clean_list(list_of_lines)
            print(clean_list(list_of_lines))
            big_string = ""
            list_of_lines = []

        else: 
            pass

    return tests


#---------------------------------------------------------------------------
def check_test_results(file_path):
    """ Opens a file at "file_path" and reads the results in a section specified by a string, then returns the results found in that file. """
    f = open(file_path, "r")
    results = split_results_after("relay close", f)

    
    f.close()
    # print(results)
    # return

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


    for root, dirs, files in os.walk("."): 
        # Not looking to parse the git directory, so skip it and skip blank dirs.
        # if (".git" in root) or (len(files) == 0): #tk - use this line to check all dirs
        if (".git" in root) or (len(files) == 0) or "M0_logs" not in root:
            continue

        root = fix_name(root)

        for f in files:
            file_path = os.path.join(root, f)
            file_path = fix_name(file_path)

            #only check results for certain file extensions (or could do it by name like checking for "AC10A04026262" in the filename)
            if not valid_extension(file_path):
                continue

            if (os.path.isfile(file_path)):
                # print(f)
                file_tests[file_path] = check_test_results(file_path)
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
def dict_to_JSON(a_dict):
    """Takes a dict, sorts it and formats it like a JSON. Then, it prints it out in the console and sends the same
    result to a new JSON file in the directory that this tool is run, unless --noJSON is specified as an argument."""
    print("-------------------------------------------------------------------------")
    print("{\n\tDirectory_name: [")
    print("\t\tFile_name: {")
    print("\t\t\tTest:    {")
    print("\t\t\t\tResults ")
    print("\t\t\t\t }")
    print("\t\t\t} ")
    print("\t\t]")
    print("} ")
    print("-------------------------------------------------------------------------")

    formatted_json_log_results = json.dumps(a_dict, indent = 8, sort_keys=True)
    print(formatted_json_log_results)

    # if includeJSON:
    log_results = open("log_results.json", "w+")
    log_results.write(formatted_json_log_results)
    log_results.close()



#---------------------------------------------------------------------------
def main():
    tree = get_file_tree()
    dict_to_JSON(tree)


#---------------------------------------------------------------------------
if __name__ == "__main__":
    main()

        
           
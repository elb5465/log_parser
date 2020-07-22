"""
@script M0_log_parser.py

This script searches through the logged outputs of the VersiCharge tests and 
determines the status of a test - Whether it was successful or not, returning 
"""

import glob
import os


def fix_name(name):
    if ' ' in name:
        new_name = name.replace(' ', '_')
        os.rename(r'{}'.format(name), r'{}'.format(new_name))
        name = new_name
    return name


for root, dirs, files in os.walk("."): 

    root = fix_name(root)

    print(root)
    # if os.path.isdir(root):
    #     print("Directory: \n", root)

    # if there are files print them out
    if len(files):
        print("Files: \n")

    for f in files:
        file_path = os.path.join(root, f)
        fix_name(file_path)

        if (os.path.isfile(file_path)):
            print(f)
           
           

    # for file_name in files:
        # file_path = os.path.abspath(file_name)
        # print(file_name)
        
        # f2 = os.listdir(".")
        
        # print(f2)
        # if ' ' in file_name:
        # file_name = file_name.replace(' ', '_')
    
        # new_file_path = os.path.abspath(file_name)
    
        # print(file_path, "                      ", new_file_path)

            # f = open(file_path, "wb")
            # # print(f.name)
            # f.close()

            # os.rename(r'{}'.format(file_path), r'{}'.format(new_file_path))
            
            # print(file_name)
            # print(os.path.abspath(file_name))

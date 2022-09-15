1. A shell script typically begins with a shebang:  
`#! /bin/bash`
> Shebang is a line on which #! is prefixed to the interpreter path. /bin/bash is the interpreter command path for Bash.

2. A script can be executed in two ways:
   * Pass the name of the script as a command-line argument:
    `bash myScript.sh`
   * A script can be executed in two ways:Pass the name of the script as a command-line argument:
    ```bash
    chmod 755 myScript.sh
    ./myScript.sh
    ```
3. This command makes a script executable by all users. The script can be executed as follows:  
    `chmod a+x ./test/1.sh`
4. Double quotes allow the shell to interpret special characters within the string. Single quotes disable this interpretation.  
   `echo 'hello'`
5. Colors for text are represented by color codes, including, reset = 0, black =30, red = 31, green = 32, yellow = 33, blue = 34, magenta = 35, cyan = 36,and white = 37.  
   `echo -e "\e[1;31m this is red \e[0m"`
6. For a colored background, reset = 0, black = 40, red = 41, green = 42, yellow = 43, blue = 44, magenta = 45, cyan = 46, and white=47, are the commonly used color codes.  
    `echo -e "\e[1;42m this is green Background \e[0m"`
7. Variable values within double quotes can be used with printf, echo, and other shell commands:  
    ```
    fruit=apple
    count=5
    echo "we have ${count} ${fruit}(s)"
    ```
8. Directory paths are delimited by the : character. Usually, \$PATH is defined in /etc/environment, /etc/profile or ~/.bashrc.To add a new path to the PATH environment, use the following command:  
 `export PATH="$PATH:/home/user/bin"`  
 Some of the well-known environment variables are HOME, PWD, USER, UID,and SHELL.
 Finding the length of a string  
`length=${#var}`

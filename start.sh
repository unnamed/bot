#!/usr/bin/env sh

##
## Create the .env file from the
## .env.template file
##
if ! [ -f ".env" ]; then

  echo "##"
  echo "## '.env' file doesn't exists"
  echo "## please enter the environment"
  echo "## variables."
  echo "##"

  for variable in $(cat .env.variables); do
    ##
    ## Read the required variables
    ## and ask the user for them
    ##
    echo ">>> Enter the '$variable' value"
    read -p ">>> " value
    echo "$variable=$value" >> ".env"
  done
fi

FLAGS="--allow-env --allow-read --allow-net --allow-write --unstable"

##
## Command used to start the bot using
## Deno, the script also adds some
## necessary flags to run the bot
##
deno run $FLAGS mod.ts
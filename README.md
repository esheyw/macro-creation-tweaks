# Macro Creation Tweaks

This is a pretty simple module that only does three things:

## Append Numbers to Newly Created Macros
Normally any Document created via a 'Create X' dialog gets a sequential number appended to it if no name is supplied, eg, `New Scene (2)`, `New Actor (50)`, etc. Creating a macro via clicking an empty hotbar slot currently does not have this handling, leading to a bunch of macros named identically (just `New Macro`) if, like me, you're lazy when writing little things to test.

## Delete Empty Macros
I accidentally click empty hotbar slots all the time, creating useless, empty macros I then have to right click -> delete. Tedious! This setting will delete any macro document if its config sheet is closed with nothing in it's command textarea.

## Set default type for newly created macros to `script`
Personally I make script macros *far* more often than chat macros, so this is the obvious choice, but if you'd like the other parts of this module without this change, it is configurable.
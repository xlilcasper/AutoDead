Auto Dead
=========
AutoDead is a combat script used to help with the death of NPCs.
It will auto mark units as bloody at half health and auto mark them dead
when hp hits 0. It will also award XP (if EasyExperience is installed as well)
and drop loot bags (Currently only has CR 0-4 coded).

Commands
=========
**!ad config**
	Prints out a config menu to chat allowing you to change all the options for the script.
*NPCsOnly* - Ignore players hit point changes.  Players and NPCs are detected two ways. If a player has a isNPC property set to 1 it is treated as an NPC. If this value is not set then it looks to see if there is one controlling player If so it is assumed to be a PC.

*Auto Kill* - if set it will monitor when a tokens HP hits 0. If this is off auto drop loot will not function neither will adding XP.

*Auto Bloody* - Mark the tokens with the bloody icon when at half health

*Drop Loot* - When an NPC token is killed, drop a loot bag.

*Remove Loot* - When on and you assign loot to a token it will remove the loot.

*Easy Experience* - When turned on it will integrate with Easy Experience to auto add experience. NOTE You currently must be using the github version for this to work.

*Layer* - Set which layer loot bags are dropped on.

*XP Cmd* - When a token is killed this sets the command that is attached to the XP button. [XP] will be replaced with the XP to be added

*Bag Img* - Token icon to use for the loot bag. You must set this to a token image in your library. You can use the **!ad tokenurl** to get the value for this

*XP Attr* - Where the XP value for killed NPC's are stored. Default is for Shaped character sheets.

*CR Attr* - Where the CR rating is stored on NPC's. Default is for Shaped character sheets.

*HP Bar* - Which bar to monitor for HP. Default is bar3 (The red bar)

*Bloody* - What icon should be used to mark a token as bloody. Default is the half heart.

*Dead* - Token to mark NPC's as dead with. Default is dead.

*Player Dead* - Token to mark players dead. This is used so you can see they are down instead of dead. Default is Arrowed

**!ad kill**
Force the selected target to be marked as dead

**!ad treasure**
Drops a loot bag for the selected token/tokens.

**!ad tokenurl**
Prints out the URL of the selected token into chat. Used to get the URL for setting the loot bag icon.

**!ad remove**
Used by one of the buttons sent when a token is killed. Removes the selected token from the map after confirmation.

**!ad sayloot**
Used to display what is in a loot bag to chat. Select the player first then the loot bag and it will be assigned to them.

To-Do
=====

 1. Make the loot window shown in chat look better
 2. Option to auto add in loot to players sheets
 3. Finish other CR loot tables
 4. Make loot tables accept JSON instead of hard coding.

 
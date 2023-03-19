## Problems
- No way to create new file.


## Architecutre Ideas
- Register events for file type. The shortcut should be customizable. There should be buttons on filetree node, and buttons in the popover should be custimizable.

## Feature Ideas
- Search key strings inside xlsx files
- Grep the data structure and format the `DataFrameInfo` of table. Besides, some checks could be performed.
- Automatically add environment properties to visualizer.
- Echarts server-side configurable items
- Configure connections to different types of databases by connection string, and get data by sqlalchemy.

## Version 0.7.0
- Feature: Used a gateway forwarding the visualizer and studio.
- Bugfix: Fixed cdn configurations for offline environments.

## Version 0.6.1
- Bugfix: If settings not compatible, MelodieStudio will fill up the missing items with default ones and write to the configuration file.

## Version 0.6.0
- Feature: Added form configurations on units;
- Feature: Added visualizer address switching mechanics;
- Enhancement: optimized package size of webpage. 

## Version 0.5.0
- Feature: Fixed network and grid visualization;
- Feature: Dynamic actions from Melodie visualizer to webpage in order to implement customized actions, eg. export table to `.xlsx` file from database.
- Enhancement: Added border to graph and visualization components.


## Version 0.4.0
- Feature: Complexed tree parameters
- Feature: Full paged visualizer for showing on the big screen
- Feature: Router panel on the page
- Bugfix: Fixed problem that dragging moves may also move charts in the same layer.

## Version 0.3.0
### New Features:
- Feature: Fusion workspace on web like an IDE.
- Feature: Visualizer&Editor for Network files`.gexf` and Table files `.sqlite`, `.xls(x)`
- Feature: The autocompletion and intellisense hint of editor
- Bugfix: Reconnection of terminals
- Bugfix: Windows cd to directories under another disk symbol
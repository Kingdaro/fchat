# Functionality
- [ ] save open channels
  - [ ] and log them? (see JSON optimization)
- [ ] add a functional character menu
  - [ ] ignore
  - [ ] report (low priority)
  - [x] open private chat tabs
  - [x] link to character's profile
  - [x] bookmark
  - [x] show friendship status & reflect it in the options
  - [ ] ~~add friend~~ accidentally adding someone will be awkward
- [ ] render ads
- [ ] add a BBCode toolbar for the chatbox
- [ ] default left click to open profile, right click to open character menu
- [ ] add user preferences
- [ ] open character profiles in an iframe
- [x] add a global character list, with friends sorted to top
- [x] sort the user list alphabetically, with precedence:
  - [x] friends (green highlight)
  - [x] bookmarks (blue highlight)
  - [x] admins (red highlight)
  - [x] looking
  - [x] rest

# UX / Styling
- [ ] mobile responsive styling
  - [ ] make center panels fullscreen at mobile size
  - [ ] make the description and userlist collapsible
- [ ] redo the chat colors (currently absent)
- [ ] add a waiting status screen for logging in
- [ ] add a plus button to the tab bar for a server list shortcut
- [ ] add close buttons for the tabs
- [ ] add dividers to split up the interface a bit
- [ ] look into darklighting OOC?
- [ ] on application start, scroll the character list down so the selected character is within view
- [ ] remove window border, add custom window buttons
- [ ] add a checkbox Vue component for easy styling
- [ ] make the tabs reorderable... ugh
- [ ] add a view to read the channel description on a larger modal
- [ ] add icons to tabs to indicate tab type
- [ ] translate statuses into human readable text in CharacterMenu
- [ ] render channel/session BBC links
- [x] use a state stack for overlays, for better UX experience
- [x] show gender in character menu
- [x] fix the private chat view
- [x] TRANSITIONS
- [x] add hover-darken to character list items

# Optimization / Cleanup
- [ ] use computed() less, wherever possible
- [ ] move user / session storage to an offline JSON config file
- [ ] return a null character from the store to handle offline users
- [ ] organize components into subfolders (overlays, chat views, etc.)
- [ ] limit the size of the message list to prevent hardcore memory leaks
- [ ] move socket logic to application side out of the view
- [x] find a way to solve the bottleneck rendering 400~500 character elements at once
- [x] holy memory usage batman
- [x] ~~find a better way to organize chat tabs declaratively~~ just using events and not being stupid with focusing works
- [x] make a file for reference events that pass through the program
- [x] move to electron

# Bugs
- [ ] check if the socket connection already exists before authenticating
- [ ] characters are not removed from active channels when they go offline

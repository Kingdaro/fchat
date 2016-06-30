# Functionality
- [ ] save open channels
  - [ ] and log them?
- [ ] add a functional character menu
  - [x] open private chat tabs
  - [ ] link to character's profile
  - [ ] add friend
  - [ ] ignore
  - [ ] bookmark
  - [ ] report (low priority)
- [ ] sort the user list alphabetically, with precedence:
  - [ ] friends (green highlight)
  - [ ] bookmarks (blue highlight)
  - [ ] admins (red highlight)
  - [ ] looking
  - [ ] rest
- [ ] render ads
- [ ] add a global character list, with friends sorted to top
- [ ] add a BBCode toolbar for the chatbox

# UX / Styling
- [ ] add a waiting status screen for logging in
- [ ] add a plus button to the tab bar for a server list shortcut
- [ ] add close buttons for the tabs
- [ ] add dividers to split up the interface a bit
- [ ] look into darklighting OOC?
- [ ] on application start, scroll the character list down so the selected character is within view
- [ ] remove window border, add custom window buttons
- [ ] add a checkbox Vue component for easy styling
- [ ] make the tabs reorderable... ugh
- [x] fix the private chat view
- [x] TRANSITIONS
- [x] add hover-darken to character list items

# Optimization / Cleanup
- [ ] use computed() less, wherever possible
- [ ] find a way to solve the bottleneck rendering 400~500 character elements at once
- [ ] holy memory usage batman
- [ ] move user / session storage to an offline JSON config file
- [ ] use an array queue for sending messages down to components?
- [x] make a file for reference events that pass through the program
- [x] move to electron

let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +1 code/caenar/src/app/page.tsx
badd +15 code/caenar/src/components/terminal.tsx
badd +13 code/caenar/src/app/styles/globals.css
badd +7 code/caenar/src/constants/TerminalCommands.ts
badd +3 code/caenar/src/constants/IconSizes.ts
badd +89 health://
badd +0 term://~/code/caenar//16451:/usr/bin/zsh
argglobal
%argdel
$argadd NvimTree_1
set stal=2
tabnew +setlocal\ bufhidden=wipe
tabnew +setlocal\ bufhidden=wipe
tabrewind
edit code/caenar/src/components/terminal.tsx
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
exe 'vert 1resize ' . ((&columns * 83 + 83) / 167)
exe 'vert 2resize ' . ((&columns * 83 + 83) / 167)
argglobal
balt code/caenar/src/constants/TerminalCommands.ts
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 15 - ((8 * winheight(0) + 21) / 43)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 15
normal! 07|
lcd ~/code/caenar
wincmd w
argglobal
if bufexists(fnamemodify("~/code/caenar/src/constants/TerminalCommands.ts", ":p")) | buffer ~/code/caenar/src/constants/TerminalCommands.ts | else | edit ~/code/caenar/src/constants/TerminalCommands.ts | endif
if &buftype ==# 'terminal'
  silent file ~/code/caenar/src/constants/TerminalCommands.ts
endif
balt ~/code/caenar/src/constants/IconSizes.ts
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 7 - ((6 * winheight(0) + 21) / 43)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 7
normal! 07|
lcd ~/code/caenar
wincmd w
2wincmd w
exe 'vert 1resize ' . ((&columns * 83 + 83) / 167)
exe 'vert 2resize ' . ((&columns * 83 + 83) / 167)
tabnext
edit ~/code/caenar/src/app/page.tsx
argglobal
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 21 - ((14 * winheight(0) + 21) / 43)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 21
normal! 0
lcd ~/code/caenar
tabnext
argglobal
if bufexists(fnamemodify("term://~/code/caenar//16451:/usr/bin/zsh", ":p")) | buffer term://~/code/caenar//16451:/usr/bin/zsh | else | edit term://~/code/caenar//16451:/usr/bin/zsh | endif
if &buftype ==# 'terminal'
  silent file term://~/code/caenar//16451:/usr/bin/zsh
endif
balt ~/code/caenar/src/constants/TerminalCommands.ts
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
let s:l = 17 - ((16 * winheight(0) + 21) / 43)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 17
normal! 0
lcd ~/code/caenar
tabnext 1
set stal=1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
nohlsearch
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :

# modOS Sevda Çiçeği
A fully open-source, modular, and multi-platform webOS.



https://github.com/user-attachments/assets/473e576e-be07-469c-a004-32e51f30791e


## Features
modOS, unlike other webOS projects, has a plentiful of unique features allowing more customization:
* Modular build.
* Developer friendly API's
* Pre-built desktop
* Account service
* And many more!

## Usage
modOS can be used everywhere by anyone, making it a great option for people on the move.

## Development
modOS comes with API's to allow integration and make it easier for developers to make new packages.

```text
Kernel
│
├── system
│   ├── sound(sound: string, times?: number)
│   │   └── Description:
│   │       └── Play a sound
│   │
│   ├── log(message: unknown, type?: messageType)
│   │   └── Description:
│   │       └── Log something to system
│   │
│   └── delay(t?: number)
│       └── Description:
│           └── Pause for t milliseconds
│
├── bino
│   │
│   ├── file
│   │   ├── write(path: string, data: any)
│   │   │   └── Description:
│   │   │       └── Write file to path with given data
│   │   │
│   │   ├── read(path: string)
│   │   │   └── Description:
│   │   │       └── Read file in path
│   │   │
│   │   ├── check(path: string)
│   │   │   └── Description:
│   │   │       └── Check if a file exists in path
│   │   │
│   │   ├── delete(path: string)
│   │   │   └── Description:
│   │   │       └── Delete a file in path
│   │   │
│   │   └── rename(path: string, newPath: string)
│   │       └── Description:
│   │           └── Rename a file in path
│   │
│   └── dir
│       ├── make(path: string)
│       │   └── Description:
│       │       └── Make a new directory in path
│       │
│       ├── list(path: string, options?)
│       │   └── Description:
│       │       └── List the contents of a directory in path
│       │
│       ├── delete(path: string)
│       │   └── Description:
│       │       └── Delete a directory in path
│       │
│       └── rename(path: string, newPath: string)
│           └── Description:
│               └── Rename a directory in path
│
├── account
│   ├── manage(credentials)
│   │   └── Description:
│   │       └── Manage account
│   │
│   ├── manageWithGoogle()
│   │   └── Description:
│   │       └── Manage account with Google
│   │
│   ├── sessionUID()
│   │   └── Description:
│   │       └── UID of user
│   │
│   ├── signOut()
│   │   └── Description:
│   │       └── Sign out the user
│   │
│   ├── linkGoogle(password: string)
│   │   └── Description:
│   │       └── Link Google account to user
│   │
│   ├── ensureUserData()
│   │   └── Description:
│   │       └── Validate User Data
│   │
│   ├── getSettings()
│   │   └── Description:
│   │       └── Fetch user settings
│   │
│   ├── getPackages()
│   │   └── Description:
│   │       └── Fetch user packages
│   │
│   ├── updateSettings()
│   │   └── Description:
│   │       └── Update user settings
│   │
│   ├── updatePackages(packages: string[])
│   │   └── Description:
│   │       └── Update use packages
│   │
│   └── update()
│       └── Description:
│           └── Update everything of user
│
├── packer
│   ├── fetch()
│   │   └── Description:
│   │       └── Fetch library of packages
│   │
│   ├── check(pckg: string)
│   │   └── Description:
│   │       └── Check for a package
│   │
│   ├── get(pckg: string)
│   │   └── Description:
│   │       └── Get a package
│   │
│   ├── remove(pckg: string)
│   │   └── Description:
│   │       └── Remove a package
│   │
│   ├── start(pckg: string)
│   │   └── Description:
│   │       └── Start a package
│   │
│   └── stop(pckg: string)
│       └── Description:
│           └── Stop a package
│
└── terminal
    ├── launch(element: HTMLElement)
    │   └── Description:
    │       └── Launch a new terminal session while killing the previous one
    │
    └── kill()
        └── Description:
            └── Kill existing terminal session
```
The default package repository can be accessed from [here](https://github.com/krambo345/krambools) for reference.
## Disclaimers
* AI was used in the making of this project.
* Project is still NOT fully complete as many features need to be fixed, added, and be completed.
## Credits
* Wassim Chegham - [Windows NT Icons](https://marketplace.visualstudio.com/items?itemName=wassimdev.windows-nt-vscode-theme)
* ACONFUSEDDRAGON - [Windows 95 Plus Icon Pack](https://aconfuseddragon.itch.io/windows-95-plus-1)
* Fast Icon Design - [Server Tower Computer](https://icon-icons.com/icon/server-tower-computer/76730)

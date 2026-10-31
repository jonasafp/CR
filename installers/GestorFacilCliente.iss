#define AppVersion "1.0.0"

[Setup]
AppId={{7E15559B-3280-41ED-90A4-ED2385ED70E1}
AppName=Gestor Fácil Cliente
AppVersion={#AppVersion}
AppPublisher=Jiah
DefaultDirName={localappdata}\Programs\Gestor Fácil Cliente
DefaultGroupName=Gestor Fácil
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=..\release\installers
OutputBaseFilename=GestorFacilCliente-Setup-{#AppVersion}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
SetupIconFile=..\build\icon-client.ico
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayIcon={app}\GestorFacilCliente.exe
CloseApplications=yes

[Files]
Source: "..\release\electron\cliente\GestorFacilCliente-win32-x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\build\icon-client.ico"; DestDir: "{app}\assets"; DestName: "GestorFacilCliente.ico"; Flags: ignoreversion

[Icons]
Name: "{group}\Gestor Fácil Cliente"; Filename: "{app}\GestorFacilCliente.exe"; WorkingDir: "{app}"; IconFilename: "{app}\assets\GestorFacilCliente.ico"; IconIndex: 0
Name: "{autodesktop}\Gestor Fácil Cliente"; Filename: "{app}\GestorFacilCliente.exe"; WorkingDir: "{app}"; IconFilename: "{app}\assets\GestorFacilCliente.ico"; IconIndex: 0

[Run]
Filename: "{app}\GestorFacilCliente.exe"; Description: "Abrir Gestor Fácil Cliente"; Flags: nowait postinstall skipifsilent

#define AppVersion "1.0.0"

[Setup]
AppId={{90F85A0C-4B3B-4CC7-89A9-BB40DB2789AA}
AppName=Gestor Fácil Controle
AppVersion={#AppVersion}
AppPublisher=Jiah
DefaultDirName={localappdata}\Programs\Gestor Fácil Controle
DefaultGroupName=Gestor Fácil
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=..\release\installers
OutputBaseFilename=GestorFacilControle-Setup-{#AppVersion}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
SetupIconFile=..\build\icon-control.ico
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayIcon={app}\Controle\GestorFacilControle.exe
CloseApplications=yes

[Files]
Source: "..\release\electron\cliente\GestorFacilCliente-win32-x64\*"; DestDir: "{app}\Cliente"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\release\electron\controle\GestorFacilControle-win32-x64\*"; DestDir: "{app}\Controle"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\build\icon-client.ico"; DestDir: "{app}\Cliente\assets"; DestName: "GestorFacilCliente.ico"; Flags: ignoreversion
Source: "..\build\icon-control.ico"; DestDir: "{app}\Controle\assets"; DestName: "GestorFacilControle.ico"; Flags: ignoreversion

[Icons]
Name: "{group}\Gestor Fácil Cliente"; Filename: "{app}\Cliente\GestorFacilCliente.exe"; WorkingDir: "{app}\Cliente"; IconFilename: "{app}\Cliente\assets\GestorFacilCliente.ico"; IconIndex: 0
Name: "{group}\Gestor Fácil Controle"; Filename: "{app}\Controle\GestorFacilControle.exe"; WorkingDir: "{app}\Controle"; IconFilename: "{app}\Controle\assets\GestorFacilControle.ico"; IconIndex: 0
Name: "{autodesktop}\Gestor Fácil Cliente"; Filename: "{app}\Cliente\GestorFacilCliente.exe"; WorkingDir: "{app}\Cliente"; IconFilename: "{app}\Cliente\assets\GestorFacilCliente.ico"; IconIndex: 0
Name: "{autodesktop}\Gestor Fácil Controle"; Filename: "{app}\Controle\GestorFacilControle.exe"; WorkingDir: "{app}\Controle"; IconFilename: "{app}\Controle\assets\GestorFacilControle.ico"; IconIndex: 0

[Run]
Filename: "{app}\Controle\GestorFacilControle.exe"; Description: "Abrir Gestor Fácil Controle"; Flags: nowait postinstall skipifsilent

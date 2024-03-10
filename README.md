# Auto Claim Bansos Hot v1.0
    Note: You Can Customize The Code For Your Usage

# Feature : 
 - Schedule Check Storage Every Random Minute And Random Second
 - Check Current Ip And Connected Ip (If Use Vpn)
 - Auto Upgrade Speed (In v1.1)
 - Auto Upgrade Storage (In v 1.2)

# Requirement : 
 - Node.js, Chrome, OpenVpn (If Not Use Can Modify Code)
 
 -  Check where your chrome user data path, and put at var chromeUserPath e.g Default Path :
    - (C:\Users\xxxx\AppData\Local\Google\Chrome\User Data)

 - Check where your OpenVpn config path and put at var folderPath, e.g Default Path :
    - (C:\Program Files\OpenVPN\config)

 - Check where your OpenVpn Executable path and put at var ovpnPath, e.g Default Path :
    - (C:\Program Files\OpenVPN\bin\openvpn-gui.exe)

 - Add wallet.txt (For Login) 

# How To Use:
 - Create all Chrome profiles depending on how many account you want to use
    - You can create first profile in chrome without account and check your Chrome User Data Path, e.g Default (C:\Users\xxxx\AppData\Local\Google\Chrome\User Data) 
    - You can duplicate the profile chrome e.g profile x in Chrome User Data Path depending on how many accounts you want to use
    
- Login Your Telegram Account In All Profile You Want Use
- After all telegram already login you can use login.js for import account
- After all account already imported, you can use index.js for claiming
#

    Important: 
- Profile Folder Name Must Like : Profile 1 - x. e.g Profile 0, Profile 1
- Key in wallet.txt for login 1 line 1 key and line in wallet.txt is implement profile chrome, so if you login with key in line 1 your key is store in profile chrome 1

#
    Credit
    Instagram   : ehhramaa_
    Twitter     : ehhramaa_

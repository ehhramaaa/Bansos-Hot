# Auto Claim Bansos Hot

    Note: You Can Customize The Code For Your Usage

# Feature : 
 - Schedule Check Storage Every Random Minute On Clock
 - Check Current Ip And Connected Ip (If Use Vpn)
 - Check Gas Free For Claim
 - Auto Upgrade Speed
 - Auto Upgrade Storage
 - Only Claiming If Level Storage And Level Speed Already 5

# Requirement : 
 - Node.js, Chrome, OpenVpn (If Not Use Can Modify Code)
 - Check where your chrome user data path, and put at var chromeUserPath e.g Default Path :

       (C:\Users\xxxx\AppData\Local\Google\Chrome\User Data)

- If Using You Using OpenVPN

- Check where your OpenVpn config path and put at var folderPath, e.g Default Path :
 
       (C:\Program Files\OpenVPN\config)

     - Check where your OpenVpn Executable path and put at var ovpnPath, e.g Default Path :

            (C:\Program Files\OpenVPN\bin\openvpn-gui.exe)

 - Add wallet.txt (For Login) 

        Important: For Key in wallet.txt 1 line 1 key and line in wallet.txt is 
        implement profile chrome, so if you login with key in line 1 your key 
        is store in profile chrome 1

# How To Use:
 - Create all Chrome profiles depending on how many account you want to use
    - You can create first profile in chrome without account and check your Chrome User Data Path, e.g Default: 

            (C:\Users\xxxx\AppData\Local\Google\Chrome\User Data) 
            
    - You can duplicate the Profile x (raw) and change the name into Profile x depending on how many accounts you want to use

            Important: Your Profile Must Be Named As: Profile x, e.g Profile 1, 
            Profile 2
    
- Login Your Telegram Account In All Profile You Want Use
- After all telegram already login you can use login.js for import account
- After all account already imported, you can use index.js for claiming
#

#
    Instagram   : ehhramaa_
    Twitter     : ehhramaa_

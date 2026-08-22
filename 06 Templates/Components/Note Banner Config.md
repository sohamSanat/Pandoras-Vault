<%* /* Note Banner Config - Selects a random Daily banner for standard notes */ 

const bannerConfigs = {
    Monday: 49,
    Tuesday: 50,
    Wednesday: 50,
    Thursday: 30,
    Friday: 30,
    Saturday: 0,
    Sunday: 2
};

// Pick a random day of the week
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const randomDay = days[Math.floor(Math.random() * days.length)];

// Try to find the correct file extension
let bannerExt = 'avif'; // Default
let baseFolder =  (window?.timeGarden?.rootPath ? window.timeGarden.rootPath.substring(1) : '') + '06 Templates/Images/Daily Notes';
const extensions = ['avif', 'gif', 'jpg', 'jpeg', 'png', 'webp'];

for (let ext of extensions) {
    let filePath = `${baseFolder}/${randomDay}Banner.${ext}`;
    let file = tp.app.vault.getAbstractFileByPath(filePath);
    if (file) {
        bannerExt = ext;
        break;
    }
}

// Add banner yaml properties
tR += `banner:
  - - ${randomDay}Banner.${bannerExt}
banner-y: ${bannerConfigs[randomDay]}
banner-x: 30
content-start: 200
banner-display: cover
banner-repeat: true
banner-height: 400
banner-fade: -75
banner-radius: 25`;
_%>

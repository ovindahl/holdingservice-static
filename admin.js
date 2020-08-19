//Admin views

var adminActionMappings = [] //Temporary global container for actionsmappings, to be made functional

let addAdminActionMapping = (actionMappings) => adminActionMappings = adminActionMappings.concat( actionMappings )

const renderAdminUI = (S, A) => { 
    adminActionMappings = [];
    document.getElementById("appContainer").innerHTML = "Admin view WIP"
    adminActionMappings.forEach( actionMapping => document.getElementById(actionMapping.triggerId).addEventListener(actionMapping.type, actionMapping.action) )
}
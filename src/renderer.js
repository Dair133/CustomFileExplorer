// File operations wrapper
class FileExplorer {
    constructor() {
        const { FileOps } = require('bindings')('file_ops');
        this.fileOps = new FileOps();
    }

    listDirectory(directory) {
        return this.fileOps.listDirectory(directory);
    }
}

// UI handling
class FileExplorerUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.fileExplorer = new FileExplorer();
        this.pathHistory = []; // Track navigation history
        this.toolbar = document.getElementById('toolbar');
        this.currentDirectory = 'C:/'


        this.filteredFileExtensions = ['.sys','.dll','.tmp'];
    }

    createFilteredFileList(){
    const filteredFileList = document.getElementById('filteredFileList');


    if(filteredFileList.hasChildNodes()){
        filteredFileList.innerHTML = ''// Removes children
    }

        this.filteredFileExtensions.forEach(ext => {
            const extensionButton  = document.createElement('button');
            extensionButton.innerText = ext+'  ';
            extensionButton.onclick= () => this.removeFilteredFileExtension(extensionButton)
            filteredFileList.appendChild(extensionButton);
        })

        const addExtensionButton = document.createElement('button');
        addExtensionButton.innerText = '+';
        addExtensionButton.onclick = () => this.addFilteredFileExtension(addExtensionButton, filteredFileList);
        filteredFileList.appendChild(addExtensionButton);
    }
 
    addFilteredFileExtension(addExtensionButton, filteredFileList){
        // Create text box for user to type their extension
        const inputBox = document.createElement('input');
        filteredFileList.appendChild(inputBox)
        // The addExtensionButton will now get the text from the text box and create new extension button
        addExtensionButton.onclick = () => this.getFileExtensionText(addExtensionButton,inputBox);
       
    }

    getFileExtensionText(addExtensionButton,inputBox){
        const newExtension = inputBox.value.trim();

         // Prevents duplicated
         if(this.filteredFileExtensions.includes(newExtension)){
            // File extension already in list return
            console.log('File extension already being filtered');
            return;
        }

        if (!newExtension.startsWith('.')) {
            console.log('Extension must start with a dot');
            return;
        }
        this.filteredFileExtensions.push(newExtension);
        inputBox.remove();

        //Resets addExtensionBUtton function so it performs original action
        addExtensionButton.onclick = () => this.addFilteredFileExtension(addExtensionButton);

        this.createFilteredFileList();
        // Now re build file list without new filtered files
        this.displayDirectory(this.currentDirectory);
    }

    removeFilteredFileExtension(extensionButton) {
        const extensionToRemove = extensionButton.innerText;
        // We use filter approach as opposed to remoaval druing iteration as its sager
        this.filteredFileExtensions = this.filteredFileExtensions.filter(ext => ext !== extensionToRemove);
        this.createFilteredFileList();
        this.displayDirectory(this.currentDirectory);
    }

    getParentDirectory(directory){
         // Remove trailing slash if it exists
         const cleanPath = directory.endsWith('/') ? directory.slice(0, -1) : directory;
         // Get parent directory
         const parentPath = cleanPath.substring(0, cleanPath.lastIndexOf('/'));
         return parentPath ? parentPath + '/' : null;
    }
    



    updateBackButton(currentPath){
        console.log('updating back button')
        let backButton = document.getElementById('backButton');
        
        // If we're at root, remove back button
        if (currentPath === 'C:/') {
            if (backButton) backButton.remove();
            return;
        }
         // Create or update back button
         if (!backButton) {
            backButton = document.createElement('button');
            backButton.id = 'backButton';
            backButton.innerText = '< Back';
            backButton.className = 'backButtonStyle'
            this.toolbar.appendChild(backButton);
        }
        const parentDir = this.getParentDirectory(currentPath);
        backButton.onclick = () => parentDir && this.displayDirectory(parentDir);
    }

    createFileButton(filename, fullPath) {
        const button = document.createElement('button');
        button.innerText = filename;
        button.onclick = () => this.displayDirectory(fullPath + '/');
        return button;
    }

   displayDirectory(directory) {
        console.log('Displaying directory:', directory);
        this.updateBackButton(directory);
        this.currentDirectory = directory;
        // Calls the actual c++ function which returns the list of files
        const files = this.fileExplorer.listDirectory(directory);
        this.container.innerHTML = '';
        
        files
        .filter(file => !this.filteredFileExtensions.some(ext => file.includes(ext)))
        .forEach(file => {
            const button = this.createFileButton(file, directory + file);
            this.container.appendChild(button);
            this.container.appendChild(document.createElement('br'));
        });
    }

    initialize(startPath) {
        this.displayDirectory(startPath,fileDepth);
        this.createFilteredFileList();
    }

}

// Entry point
document.addEventListener('DOMContentLoaded', () => {
    const explorer = new FileExplorerUI('fileList');
    explorer.initialize('C:/');
});
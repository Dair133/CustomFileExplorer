#include "file_ops.h"
#include <filesystem>
#include <iostream>
// Add this declaration at the top with other declarations
Napi::Object InitAll(Napi::Env env, Napi::Object exports);
namespace fs = std::filesystem;
// This function is essentially the link between nodejs, and c++
Napi::Object FileOps::Init(Napi::Env env, Napi::Object exports) {
    Napi::Function func = DefineClass(env, "FileOps", {
        InstanceMethod("listDirectory", &FileOps::ListDirectory)// Exports function FileOps::ListDirectory to nodejs under name 'listDirectory'
        // If we wanted to export another function to nodeJs we would have to do InstanceMethod a second time.
    });
    // Persistent reference to the constructor function
    /// we do this so nodesjs' garbage collector knows to keep this reference around
    Napi::FunctionReference* constructor = new Napi::FunctionReference();
    *constructor = Napi::Persistent(func);
    
    // Makes the class available in nodejs by adding it to the exports object
    exports.Set("FileOps", func);
    return exports;
}

FileOps::FileOps(const Napi::CallbackInfo& info) 
    : Napi::ObjectWrap<FileOps>(info) {}

std::vector<std::string> FileOps::GetDirectoryContents(const std::string& path) {
    std::vector<std::string> contents;
    try {
        for (const auto& entry : fs::directory_iterator(path)) {
            contents.push_back(entry.path().filename().string());
        }
    }
    catch (const std::exception& e) {
        std::cerr << "Error reading directory: " << e.what() << std::endl;
    }
    return contents;
}

Napi::Value FileOps::ListDirectory(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsString()) {
        throw Napi::Error::New(env, "Path argument required");
    }

    std::string path = info[0].As<Napi::String>();
    auto contents = GetDirectoryContents(path);

    Napi::Array result = Napi::Array::New(env, contents.size());
    for (size_t i = 0; i < contents.size(); i++) {
        result.Set(i, contents[i]);
    }

    return result;
}


// At the bottom of the file, add these:
Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
    return FileOps::Init(env, exports);
}

NODE_API_MODULE(file_ops, InitAll)
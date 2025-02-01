// #include "file_ops.h"
// #include <filesystem>
// #include <iostream>

// Napi::Object InitAll(Napi::Env env, Napi::Object exports);
// namespace fs = std::filesystem;


// Napi::Object FileOps::Init(Napi::Env env, Napi::Object exports) {
//     std::cout << "[DEBUG] Registering FileOps class..." << std::endl;

//     Napi::Function func = DefineClass(env, "FileOps", {
//         InstanceMethod("listDirectory", &FileOps::ListDirectory)
//     });

//     std::cout << "[DEBUG] Methods registered: listDirectory" << std::endl;

//     Napi::FunctionReference* constructor = new Napi::FunctionReference();
//     *constructor = Napi::Persistent(func);
//     env.SetInstanceData(constructor);

//     exports.Set("FileOps", func);
//     return exports;
// }

// // Constructor implementation
// FileOps::FileOps(const Napi::CallbackInfo& info) 
//     : Napi::ObjectWrap<FileOps>(info) {
// }

// std::vector<FileInfo> FileOps::GetDirectoryContents(const std::string& path, int depth) {
//     std::vector<FileInfo> contents;
//     try {
//         for (const auto& entry : fs::directory_iterator(path)) {
//             FileInfo fileInfo;
//             fileInfo.name = entry.path().filename().string();
//             fileInfo.isDirectory = fs::is_directory(entry.path());
            
//             if (fileInfo.isDirectory && depth > 0) {
//                 fileInfo.children = GetDirectoryContents(entry.path().string(), depth - 1);
//             }
//             contents.push_back(fileInfo);
//         }
//     }
//     catch (const std::exception& e) {
//         std::cerr << "Error reading directory: " << e.what() << std::endl;
//     }
//     return contents;
// }

// Napi::Object ConvertFileInfoToObject(const FileInfo& fileInfo, Napi::Env env) {
//     Napi::Object entry = Napi::Object::New(env);
//     entry.Set("name", fileInfo.name);
//     entry.Set("isDirectory", fileInfo.isDirectory);
    
//     if (fileInfo.isDirectory && !fileInfo.children.empty()) {
//         Napi::Array children = Napi::Array::New(env, fileInfo.children.size());
//         for (size_t i = 0; i < fileInfo.children.size(); i++) {
//             children.Set(i, ConvertFileInfoToObject(fileInfo.children[i], env));
//         }
//         entry.Set("children", children);
//     }
    
//     return entry;
// }

// Napi::Value FileOps::ListDirectory(const Napi::CallbackInfo& info) {
//     Napi::Env env = info.Env();

//     if (info.Length() < 1 || !info[0].IsString()) {
//         throw Napi::Error::New(env, "Path argument required");
//     }

//     std::string path = info[0].As<Napi::String>();
//     auto contents = GetDirectoryContents(path);

//     Napi::Array result = Napi::Array::New(env, contents.size());
//     for (size_t i = 0; i < contents.size(); i++) {
//         result.Set(i, ConvertFileInfoToObject(contents[i], env));
//     }

//     return result;
// }

// // At the bottom of the file, add these:
// Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
//     std::cout << "Initializing file_ops module" << std::endl;  // Debug print
//     return FileOps::Init(env, exports);
// }

// NODE_API_MODULE(file_ops, InitAll)
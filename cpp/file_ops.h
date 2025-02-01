// #pragma once
// #include <napi.h>
// #include <string>
// #include <vector>

// // Define the struct before the class
// struct FileInfo {
//     std::string name;
//     bool isDirectory;
//     std::vector<FileInfo> children;
// };

// class FileOps : public Napi::ObjectWrap<FileOps> {
//  public:
//     static Napi::Object Init(Napi::Env env, Napi::Object exports);
//     FileOps(const Napi::CallbackInfo& info);

//  private:
//     Napi::Value ListDirectory(const Napi::CallbackInfo& info);
//     // Update the function signature to match the cpp file
//     std::vector<FileInfo> GetDirectoryContents(const std::string& path, int depth = 1);
// };
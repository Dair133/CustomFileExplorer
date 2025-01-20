#pragma once
#include <napi.h>
#include <string>
#include <vector>

class FileOps : public Napi::ObjectWrap<FileOps> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  FileOps(const Napi::CallbackInfo& info);

 private:
  Napi::Value ListDirectory(const Napi::CallbackInfo& info);
  std::vector<std::string> GetDirectoryContents(const std::string& path);
};
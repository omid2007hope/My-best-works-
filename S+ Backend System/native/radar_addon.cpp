#include <napi.h>

namespace
{

    Napi::Object NotImplemented(const Napi::Env &env, const char *method)
    {
        Napi::Object result = Napi::Object::New(env);
        result.Set("ok", Napi::Boolean::New(env, false));
        result.Set("code", Napi::String::New(env, "NOT_IMPLEMENTED"));
        result.Set("method", Napi::String::New(env, method));
        result.Set(
            "message",
            Napi::String::New(env,
                              "Radar native integration scaffold is ready. Link your "
                              "vendor Radar SDK implementation to activate this method."));
        return result;
    }

    Napi::Value Init(const Napi::CallbackInfo &info)
    {
        return NotImplemented(info.Env(), "init");
    }

    Napi::Value Create(const Napi::CallbackInfo &info)
    {
        return NotImplemented(info.Env(), "create");
    }

    Napi::Value Destroy(const Napi::CallbackInfo &info)
    {
        return NotImplemented(info.Env(), "destroy");
    }

    Napi::Value Deinit(const Napi::CallbackInfo &info)
    {
        return NotImplemented(info.Env(), "deinit");
    }

    Napi::Value TurnOn(const Napi::CallbackInfo &info)
    {
        return NotImplemented(info.Env(), "turnOn");
    }

    Napi::Value TurnOff(const Napi::CallbackInfo &info)
    {
        return NotImplemented(info.Env(), "turnOff");
    }

    Napi::Value StartDataStreaming(const Napi::CallbackInfo &info)
    {
        return NotImplemented(info.Env(), "startDataStreaming");
    }

    Napi::Value StopDataStreaming(const Napi::CallbackInfo &info)
    {
        return NotImplemented(info.Env(), "stopDataStreaming");
    }

    Napi::Value IsBurstReady(const Napi::CallbackInfo &info)
    {
        return NotImplemented(info.Env(), "isBurstReady");
    }

    Napi::Value ReadBurst(const Napi::CallbackInfo &info)
    {
        return NotImplemented(info.Env(), "readBurst");
    }

    Napi::Value SetCountryCode(const Napi::CallbackInfo &info)
    {
        return NotImplemented(info.Env(), "setCountryCode");
    }

    Napi::Value GetSensorInfo(const Napi::CallbackInfo &info)
    {
        return NotImplemented(info.Env(), "getSensorInfo");
    }

    Napi::Value GetBuildInfo(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();
        Napi::Object result = Napi::Object::New(env);
        result.Set("ok", Napi::Boolean::New(env, true));
        result.Set("name", Napi::String::New(env, "radar_addon"));
        result.Set("status", Napi::String::New(env, "scaffold"));
        return result;
    }

    Napi::Object InitModule(Napi::Env env, Napi::Object exports)
    {
        exports.Set(Napi::String::New(env, "init"),
                    Napi::Function::New(env, Init));
        exports.Set(Napi::String::New(env, "create"),
                    Napi::Function::New(env, Create));
        exports.Set(Napi::String::New(env, "destroy"),
                    Napi::Function::New(env, Destroy));
        exports.Set(Napi::String::New(env, "deinit"),
                    Napi::Function::New(env, Deinit));
        exports.Set(Napi::String::New(env, "turnOn"),
                    Napi::Function::New(env, TurnOn));
        exports.Set(Napi::String::New(env, "turnOff"),
                    Napi::Function::New(env, TurnOff));
        exports.Set(Napi::String::New(env, "startDataStreaming"),
                    Napi::Function::New(env, StartDataStreaming));
        exports.Set(Napi::String::New(env, "stopDataStreaming"),
                    Napi::Function::New(env, StopDataStreaming));
        exports.Set(Napi::String::New(env, "isBurstReady"),
                    Napi::Function::New(env, IsBurstReady));
        exports.Set(Napi::String::New(env, "readBurst"),
                    Napi::Function::New(env, ReadBurst));
        exports.Set(Napi::String::New(env, "setCountryCode"),
                    Napi::Function::New(env, SetCountryCode));
        exports.Set(Napi::String::New(env, "getSensorInfo"),
                    Napi::Function::New(env, GetSensorInfo));
        exports.Set(Napi::String::New(env, "getBuildInfo"),
                    Napi::Function::New(env, GetBuildInfo));
        return exports;
    }

} // namespace

NODE_API_MODULE(radar_addon, InitModule)

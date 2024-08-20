import pathlib
from typing import Any, Callable, Set
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class MainConfig(BaseSettings):
    model_config = SettingsConfigDict(env_prefix='SD_')
    
    server_host: str = "127.0.0.1"
    server_port: int = 8000
    root_dir: pathlib.Path = pathlib.Path(".")
    @field_validator('root_dir')
    def validate_root_dir(cls, v: pathlib.Path) -> pathlib.Path:
        v = v.resolve()
        if not v.is_dir():
            raise ValueError(f"{v} is not a directory")
        return v

if __name__ == "__main__":
    print(MainConfig().model_dump())
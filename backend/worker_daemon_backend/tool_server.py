import asyncio
from typing import Optional, Type
import uuid
from fastapi import FastAPI
from tender.utils.tool_use.tools.shell_tools import ShellTool, ShellToolInput
from tender.utils.docker.docker_utils import DockerSessionNPS

from tender.utils.tool_use.tools.tool_interface import (
    TypedBaseTool,
    Input,
    Output,
    State,
)

WORKER_CONTAINER_NAME = "worker-container"


async def mk_container_instance(
    _image_id: str, timeout: float, _container_id: Optional[uuid.UUID] = None
):
    return await DockerSessionNPS.new_from_existing(
        container_id=WORKER_CONTAINER_NAME, command_timeout=timeout
    )


def register_tools(app: FastAPI):
    def register_api_endpoint(
        tool: TypedBaseTool[Input, Output,
                            State], # type: ignore
        input_type: Type[Input],
        output_type: Type[Output],
        api: FastAPI,
    ):
        async def endpoint(tool_id: uuid.UUID, input: input_type):
            print(tool_id)
            return await tool.use_tool_struct(tool_id, input)

        api.add_api_route(
            path=f"/tool/{tool.tool_name}/{{tool_id}}",
            endpoint=endpoint,  # type: ignore
            response_model=output_type,
            methods=["POST"],
        )

    register_api_endpoint(
        tool=ShellTool(image_name="python:3.10", mk_session_fn=mk_container_instance),
        input_type=ShellToolInput,
        output_type=str,
        api=app,
    )


# if __name__ == "__main__":
app = FastAPI()
register_tools(app)

print(app.openapi())

if __name__ == "__main__":
    tool = ShellTool(
        image_name="8a5c71d18c06",
    )
    print(
        asyncio.run(
            tool.use_tool_struct(uuid.uuid4(), ShellToolInput(command="echo hello"))
        )
    )

"""
AI description helper endpoint.

Uses the Anthropic Claude API to generate task descriptions
based on a task title and workspace context.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from config import settings

router = APIRouter(prefix="/ai", tags=["ai"])


class DescribeTaskRequest(BaseModel):
    """
    Request schema for the AI describe-task endpoint.

    Args:
        title: The task title to generate a description for.
        workspace_name: The workspace context for better descriptions.
    """
    title: str
    workspace_name: str


class DescribeTaskResponse(BaseModel):
    """
    Response schema for the AI describe-task endpoint.

    Args:
        description: AI-generated task description (2-3 sentences).
    """
    description: str


@router.post("/describe-task", response_model=DescribeTaskResponse)
async def describe_task(data: DescribeTaskRequest):
    """
    Generate an AI-powered task description from a title and workspace name.

    Calls the Anthropic Claude API with a prompt that includes the task
    title and workspace context to produce a concise, actionable description.

    Args:
        data: DescribeTaskRequest with title and workspace_name.

    Returns:
        DescribeTaskResponse with the generated description.

    Raises:
        HTTPException 500: If the API call fails or key is missing.
    """
    if not settings.anthropic_api_key or settings.anthropic_api_key == "sk-ant-xxxxx":
        raise HTTPException(
            status_code=500,
            detail="Anthropic API key not configured. Set ANTHROPIC_API_KEY in .env",
        )

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

        message = client.messages.create(
            model="claude-sonnet-4-5-20250514",
            max_tokens=256,
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Write a brief, actionable task description (2-3 sentences) for a task "
                        f"titled '{data.title}' in the workspace '{data.workspace_name}'. "
                        f"Be specific and practical. Do not include the title itself in the "
                        f"description. Just return the description text, nothing else."
                    ),
                }
            ],
        )

        description = message.content[0].text.strip()
        return DescribeTaskResponse(description=description)

    except anthropic.APIError as e:
        raise HTTPException(status_code=500, detail=f"Anthropic API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI helper error: {str(e)}")

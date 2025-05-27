from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def slasher_exception_handler(exc, context):
    """!
    @brief Wrap DRF's default handler so every error comes back with 
           the same envelope - and so uncaught exceptions are never leaked.
    """
    # Let DRF deal with the common cases first.
    response = exception_handler(exc, context)

    if response is None:
        # Unhandled exception, return 500 internal server error
        return Response(
            {"success": False, "errors": {"detail": ["Internal server error"]}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Handled by DRF (ValidationError, 404, …), normalise the body
    response.data = {"success": False, "errors": response.data}
    return response

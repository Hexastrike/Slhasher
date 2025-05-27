from rest_framework.renderers import BaseRenderer

class CSVRenderer(BaseRenderer):
    """
    @brief Custom renderer that advertises text/csv so the DRF content-negotiation
    layer can satisfy requests with the header Accept: text/csv

    Without a renderer whose media_type matches text/csv, DRF raises
    406 Not Acceptable before the view`s StreamingHttpResponse is
    returned.  This renderer simply passes through the byte/str payload already
    produced by the view.
    """
    media_type = "text/csv"
    format = "csv"
    charset = "utf-8"

    # The view already streams bytes/str; just return them unchanged
    def render(self, data, media_type=None, renderer_context=None):
        """
        DRF calls this just before the response is returned.

        The export view has already produced a bytes/str payload,
        so we return *data* unchanged.
        """
        return data
public class WSMember: Member
{
    public IToken<string> Method { get; set; }
    public IToken<string> Query { get; set; }

    public override async ValueTask<CommandElement> CreateHtmlElementAsync(IContext context)
    {
        var tag = await base.CreateHtmlElementAsync(context).ConfigureAwait(false);
        await tag.AddAttributeIsExistAsync("method", Method, context).ConfigureAwait(false);
        await tag.AddAttributeIsExistAsync("query", Query, context).ConfigureAwait(false);
        return tag;
    }

}
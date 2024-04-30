public class WS : SourceCommand<WSMember>
{

    protected override async Task<DataSet> LoadDataAsync(string sourceName, IContext context)
    {

        string html = await ToCustomFormatHtmlAsync(context).ConfigureAwait(false);
        //context.DomainId

        JObject jo = new JObject();
        jo.Add("command", html.ToBase64());
        jo.Add("dmnid", context.DomainId?.ToBase64());           

        string message = jo.ToString();
        byte[] byteMessage = Encoding.UTF8.GetBytes(message);
        var connectionName = await ConnectionName.GetValueOrDefaultAsync(context).ConfigureAwait(false);
        return await context.LoadDataAsync(
            sourceName: sourceName,
            connectionName: connectionName ?? context.GetDefault("WS.Source"),
            parameters: new CaseInsensitiveDictionary<object>()
            {
                ["byteMessage"] = byteMessage
            }).ConfigureAwait(false);
    }
}
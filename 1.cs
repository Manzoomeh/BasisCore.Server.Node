public static DataSet FromSocketResultToDataSet(this byte[] bytes)
{
    var receivedJson = Encoding.UTF8.GetString(bytes);
    var retVal = new DataSet();
    var content = JsonSerializer.Deserialize<DataServiceResult>(receivedJson);
    
    if (content?.sources != null)
    {
        foreach (var source in content.sources)
        {
            var tbl = new DataTable();
            tbl.TableName = source.options?.tableName;

            if (source.data.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in source.data.EnumerateArray())
                {
                    if (tbl.Rows.Count == 0)
                    {
                        setColumns(tbl, item);
                    }
                    fillTable(tbl, item);
                }
            }
            else if (source.data.ValueKind == JsonValueKind.Object)
            {
                setColumns(tbl, source.data);
                fillTable(tbl, source.data);
            }
            else
            {
                tbl.Columns.Add("result");
                var row = tbl.NewRow();
                row[0] = source.data.GetRawText();
                tbl.Rows.Add(row);
            }
            if (tbl.Rows.Count == 0 && source.options.columnNames != null)
            {
                foreach (var columnName in source.options.columnNames)
                {
                    tbl.Columns.Add(columnName);
                }
            }
            retVal.Tables.Add(tbl);
        }

        static void setColumns(DataTable table, JsonElement firstObject)
            => table.Columns.AddRange(firstObject.EnumerateObject().Select(x => new DataColumn(x.Name, x.Value.ValueKind == JsonValueKind.Number ? typeof(decimal) : typeof(string))).ToArray());

        static void fillTable(DataTable table, JsonElement jsonElement)
        {
            var row = table.NewRow();
            foreach (var property in jsonElement.EnumerateObject())
            {
                row[property.Name] = property.Value.ValueKind switch
                {
                    JsonValueKind.Number => property.Value.GetDecimal(),
                    JsonValueKind.Array => property.Value.GetRawText(),
                    JsonValueKind.Object => property.Value.GetRawText(),
                    _ => property.Value.GetString(),
                };
            }
            table.Rows.Add(row);
        }
    }
    else
    {
        var error = JsonSerializer.Deserialize<DataServiceError>(receivedJson);
        if (error != null)
        {
            throw new WebServerException($"Error from Socket Connection. {error.errorMessage} (Error Code: {error.errorCode})");
        }
    }
    return retVal;
}
//another code 
public override async Task<DataSet> LoadDataAsync(CancellationToken cancellationToken, IDictionary<string, object> parameters)
{
    var args = new Dictionary<string, object>(3);
    if (parameters.TryGetValue("command", out var command))
    {
        args["command"] = command;
    }
    if (parameters.TryGetValue("dmnid", out var dmnid))
    {
        args["dmnid"] = dmnid;
    }
    if (parameters.TryGetValue("params", out var paramsTable) && paramsTable is DataTable tmpTbl && tmpTbl.Rows.Count > 0)
    {
        var newParamsList = tmpTbl.AsEnumerable().ToDictionary(x => x.Field<string>("name"), x => x.Field<string>("value"));
        args["params"] = newParamsList;
    }
    var arg = JsonSerializer.Serialize(args);
    byte[] byteMessage = Encoding.UTF8.GetBytes(arg);
    var result = await SendMessageAsync(byteMessage, cancellationToken).ConfigureAwait(false);
    return result.FromSocketResultToDataSet();
}
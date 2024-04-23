using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace WebServer.Common
{
    public class JsonToTreeStructureTableConverter
    {
        public DataTable Result { get; private set; }
        public string PathDelimiter { get; private set; }
        public JsonToTreeStructureTableConverter(string json,  string pathDelimiter)
            : this(BsonDocument.Parse(json), pathDelimiter)
        {
        }

        public JsonToTreeStructureTableConverter(BsonDocument bsonDocument, string pathDelimiter)
        {
            Result = new DataTable();
            PathDelimiter = pathDelimiter;
            var idCol = Result.Columns.Add("Id", typeof(long));
            idCol.AutoIncrement = true;
            idCol.AutoIncrementSeed = 1;
            idCol.AutoIncrementStep = 1;
            Result.Columns.Add("ParentId", typeof(long));
            Result.Columns.Add("Field", typeof(string));
            Result.Columns.Add("Value", typeof(string));
            Result.Columns.Add("Type", typeof(string));
            Result.Columns.Add("Path", typeof(string));
            ParseBsonToTable(bsonDocument, null);
        }
        private void ParseBsonToTable(BsonDocument bElem, DataRow parentRow)
        {
            foreach (BsonElement element in bElem.AsBsonDocument.Elements)
            {
                if (element.Value.IsBsonDocument)
                {
                    var newRow = AddObjectRow(element.Name, element.Value, parentRow);
                    ParseBsonToTable(element.Value.AsBsonDocument, newRow);
                }
                else if (element.Value.IsBsonArray)
                {
                    ParseBsonArray(element.Value, element.Name, parentRow);
                }
                else
                {
                    AddScalarRow(element, parentRow);
                }
            }

        }
        private void ParseBsonArray(BsonValue element, string name, DataRow parentRow)
        {
            var newRow = AddArrayRow(name, element.AsBsonValue, parentRow);
            foreach (var arrayElement in element.AsBsonArray)
            {
                if (arrayElement.IsBsonDocument)
                {
                    var newParent = AddObjectRow(null, arrayElement, newRow);
                    ParseBsonToTable(arrayElement.AsBsonDocument, newParent);
                }
                else if (arrayElement.IsBsonArray)
                {
                    ParseBsonArray(arrayElement, null, newRow);
                }
                else
                {
                    AddScalarRow(arrayElement, newRow);
                }
            }
        }
        private DataRow AddArrayRow(string name, BsonValue value, DataRow parentRow)
        {
            return AddRow(name, value, parentRow, "Array");
        }
        private DataRow AddScalarRow(BsonValue value, DataRow parentRow)
        {
            return AddRow(null, value, parentRow, "Scalar");
        }
        private DataRow AddScalarRow(BsonElement? element, DataRow parentRow)
        {
            string name = null;
            BsonValue value = null;
            if (element.HasValue)
            {
                name = element.Value.Name;
                value = element.Value.Value;
            }
            return AddRow(name, value, parentRow, "Scalar");
        }
        private DataRow AddObjectRow(string name, BsonValue value, DataRow parentRow)
        {
            return AddRow(name, value, parentRow, "Object");
        }
        private DataRow AddNullRow(DataRow parentRow)
        {
            return AddRow(null, null, parentRow, "Null");
        }
        private DataRow AddRow(string title, BsonValue value, DataRow parentRow, string type)
        {
            if (type == "Scalar")
            {
                if (value.IsBoolean)
                {
                    type += ".Boolean";
                }
                else if (value.IsNumeric)
                {
                    type += ".Numeric";
                }
                else if (value.IsBsonUndefined)
                {
                    value = "undefined";
                    type += ".Undefined";
                }
                else if (value.IsBsonNull)
                {
                    value = "null";
                    type += ".Null";
                }
                else
                {
                    type += ".String";
                }
            }
            string path = null;
            if (!string.IsNullOrEmpty(title))
            {
                path = string.Format("{0}{1}{2}", parentRow == null ? "" : parentRow.Field<string>("Path"), PathDelimiter, title);
            }
            else if (parentRow != null)
            {
                path = string.Format("{0}[{1}]", parentRow.Field<string>("Path"), Result.AsEnumerable().Count(x => x["ParentId"].Equals(parentRow["Id"])));
            }
            return Result.Rows.Add(null, parentRow == null ? null : parentRow["Id"], title, value, type, path);
        }
    }
}

from bclib import edge
from datetime import datetime
options = {
    "endpoint": "127.0.0.1:8000",
    "router":  "web"
}

app = edge.from_options(options)
import asyncio 
#index 5
@app.restful_action()
async def process_web_remain_request(context: edge.WebContext):
    context.mime = edge.HttpMimeTypes.JPEG
    context.response_type = edge.ResponseTypes.STATIC_FILE
    cms = context.cms.cms
    if "webserver" not in cms:
        cms["webserver"] = dict()

    cms["webserver"]["filepath"] = "C:\\Users\\Ali\\Desktop\\fingerfoofProduct1.jpg"
    print(context.cms)
    return context.cms

@app.web_action()
async def process_web_remain_request(context: edge.WebContext):
    context.response_type = edge.ResponseTypes.RENDERABLE
    context.add_header("x-qam","12121")
    context.cms.cms["page_il"]='{"$type":"group","core":"group","name":"ROOT_GROUP","Commands":[{"$type":"inlinesource","core":"inlinesource","name":"basisName","Members":[{"name":"memberName","content":"\\r\\n <row fieldName1=\\"test1\\" fieldName2=\\"1-2\\" fieldName3=\\"fieldName3-1\\" />\\r\\n <row fieldName1=\\"test2\\" fieldName2=\\"2-2\\" fieldName3=\\"fieldName3-2\\" />\\r\\n <row fieldName1=\\"test3\\" fieldName2=\\"3-2\\" fieldName3=\\"fieldName3-3\\" />\\r\\n <row fieldName1=\\"test4\\" fieldName2=\\"4-2\\" fieldName3=\\"fieldName3-4\\" />\\r\\n <row fieldName1=\\"test5\\" fieldName2=\\"5-2\\" fieldName3=\\"fieldName3-5\\" />\\r\\n "}]},{"$type":"print","core":"print","data-member-name":"basisName.memberName","layout-content":"\\r\\n <ul>\\r\\n @child\\r\\n </ul>\\r\\n ","faces":[{"content":"\\r\\n <li> @fieldName1 (@fieldName2) - (@fieldName3) </li>\\r\\n "}]}]}'
    context.cms.cms["isCachingAllowed"] =  True
    context.cms.cms["assetExpireAfterDays"] = 5
    context.cms.cms["expireDate"] = 4
    context.cms.cms["ownerId"] = 4455
    context.cms.cms["dmnid"] =1111
    context.cms.cms["hostexpiredate"] = datetime(2024,5,11).strftime("%Y-%m-%d")
    return ""

app.listening()
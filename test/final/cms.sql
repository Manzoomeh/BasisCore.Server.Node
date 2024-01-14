CREATE PROCEDURE [dbo].[cmsIOT]
        @params DBSourceParamCollection READONLY
AS
begin

        select * from @params
		union all
        select 'http','Expires', 'max-age=522280,public'
		union all
		select 'http','date',  'TEST'
        union all
		select 'http', 'Server', 'BasisCore 4.0.1' 
		--union all
		--select 'http', 'Set-Cookie', 'flavor=choco; SameSite=None; Secure' 
        union all
        select 'cms','content', ''
        union all
		select 'cms','page_il', '{"$type":"group","core":"group","name":"ROOT_GROUP","Commands":[{"$type":"rawtext","core":"rawtext","content":["<!DOCTYPE html><html lang=\"en\" ><head><meta charset=\"UTF-8\" ><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" ><meta name=\"description\" content=\"",{"Params":[{"Column":"cms","Member":"seo","Source":"description"}]},"\" ><link rel=\"stylesheet\" href=\"http://iot.ir/css/swiper-bundle.min.css\" /><link href=\"http://iot.ir/css/output.css\" rel=\"stylesheet\" ><!-- href=\"/dist/output.css\" rel=\"stylesheet\" > -->\n    <title>",{"Params":[{"Column":"cms","Member":"seo","Source":"title"}]},"</title><style>\n        select {\n            /* Arrow */\n            appearance: none;\n            background-image: url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\");\n            background-repeat: no-repeat;\n            background-position: 1.5rem;\n            background-size: 0.65rem auto;\n        }\n    </style>"]},{"$type":"call","core":"call","FileName":"google.analytics.inc"},{"$type":"rawtext","core":"rawtext","content":["</head><body><!-- core=\"call\" file=\"_navdark.html\" method=\"get\" run=\"atclient\" ></basis> -->\n    <basis core=\"call\" file=\"navdark.inc\" ></basis><basis core=\"dbsource\" name=\"db\" source=\"basiscore\" lid=\"1\" mid=\"18\" usedforid=\"202948\" ><member name=\"scalar\" type=\"scalar\" typeid=\"150\" order=\"id desc\" ></member></basis><!--><img src=\"http://iot.ir/images/background-comanies2.png\" alt=\"background-comanies2\" class=\"absolute right-0 top-[20vw]\" style=\"mix-blend-mode: darken; z-index: -1;\" ><!--><div id=\"section_header_comapnies\" class=\"w-full mt-[8vw] relative container overflow-hidden\" ><!--><div id=\"breadcrump\" class=\"pb-[4vh] flex flex-row items-center justify-end gap-2\" ><div\n class=\"flex flex-row-reverse items-center justify-between text-[0.8vw] gap-[10px] px-[20px] py-[10px] bg-[#DCDDDE] rounded-[70px] LaptopM:p-2\" ><a href=\"http://iot.ir/\" ><img src=\"http://iot.ir/images/iot.svg\" alt=\"iot\" class=\"w-[1.4vw]\" ></a><p>/</p><p>",{"Params":[{"Column":"db","Member":"scalar","Source":"column1"}]},"</p></div></div><div class=\"flex flex-row-reverse justify-between items-start\" ><h1 class=\"w-[40%] text-[3vw] text-black font-[700]\" >این قسمت یک تیتر برای صفحه نوشته شود</h1><p class=\"w-[40%] text-[1vw] text-justify\" >ذی‌نفعان مختلف، پیشنهادات، انتقادات و یا نواقص احتمالی را\n                گزارش\n                می‌کنند. بر\n                این اساس IoT تغییرات وذی‌نفعان مختلف، پیشنهادات، انتقادات و یا نواقص احتمالی را گزارش می‌کنند. بر\n                این\n                اساس IoT تغییرات و</p></div><a href=\"#title_title\" class=\"cursor-pointer\" ><img src=\"http://iot.ir/images/arrow-bottom-full-dark.png\" alt=\"arrow-bottom-full-dark\" class=\"w-[3vw] mt-24 mb-16 h-fit float-right\" ></a></div><!--><img src=\"http://iot.ir/images/background-comanies.png\" alt=\"background-comanies\" class=\"absolute right-0 top-[20vw]\" style=\"mix-blend-mode: darken; z-index: -1;\" ><!--><div id=\"title_title\" class=\"relative overflow-hidden\" ><div class=\"container w-full flex flex-row-reverse justify-between items-center gap-[10%] z-10 sticky\" ><div class=\"bg-[#FFFFFFB2] gap-4 pr-4 flex flex-row-reverse items-center w-[70%] h-20 rounded-[70px]\" ><div onclick=\"redirectSearch()\" class=\"z-10 cursor-pointer\" ><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\" viewBox=\"0 0 30 30\" fill=\"none\" ><g opacity=\"0.7\" ><path rule=\"evenodd\" d=\"M14.5 5.75C9.66751 5.75 5.75 9.66751 5.75 14.5C5.75 19.3325 9.66751 23.25 14.5 23.25C19.3325 23.25 23.25 19.3325 23.25 14.5C23.25 9.66751 19.3325 5.75 14.5 5.75ZM4.25 14.5C4.25 8.83908 8.83908 4.25 14.5 4.25C20.1609 4.25 24.75 8.83908 24.75 14.5C24.75 20.1609 20.1609 24.75 14.5 24.75C8.83908 24.75 4.25 20.1609 4.25 14.5ZM22.4697 22.4697C22.7626 22.1768 23.2374 22.1768 23.5303 22.4697L25.5303 24.4697C25.8232 24.7626 25.8232 25.2374 25.5303 25.5303C25.2374 25.8232 24.7626 25.8232 24.4697 25.5303L22.4697 23.5303C22.1768 23.2374 22.1768 22.7626 22.4697 22.4697Z\" fill=\"#424B54\" /></g></svg></div><input id=\"searchBox\" type=\"text\" class=\"focus:border-0 focus:outline-0 h3--tag text-[1vw] w-full h-full\" placeholder=\"جستجو کنید ...\" style=\"direction: rtl; background-color: transparent;\" ></div><div class=\"w-[20%]\" ><!-- name=\"undefined\" id=\"undefined\" class=\"w-full flex flex-row-reverse items-center justify-center bg-[#FFFFFFB2] rounded-[70px] p-6 pl-10 active:outline-0 focus:outline-0\" style=\"direction: rtl;\" ><option value=\"0\" >دسته بندی محصولات</option></select> -->\n                <div onclick=\"redirectSearch()\" ><button id=\"btn_hover\" class=\"w-full h-20 px-[1.5vw] py-[1vw] flex items-center justify-center gap-[1.8vw] opacity-70 bg-[#FFFFFFB2] text-black text-[1vw] rounded-[70px] hover:bg-yellow cursor-pointer transition-all\" style=\"backdrop-filter: blur(5px);\" ><span\n style=\"font-size: 1.2vw !important;\" >جستجو</span><span><svg width=\"8\" height=\"16\" viewBox=\"0 0 8 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" ><path d=\"M7 1L1 8L7 15\" stroke=\"#222\" width=\"1.5\" linecap=\"round\" linejoin=\"round\" /></svg></span></button></div></div></div></div><!--><div class=\"relative\" ><img src=\"http://iot.ir/images/background-header-aboutus.png\" alt=\"background-header-aboutus\" class=\"absolute left-0 bottom-[20%] mix-blend-multiply\" ><img src=\"http://iot.ir/images/background-header-aboutus.png\" alt=\"background-header-aboutus\" class=\"absolute rotate-180 right-0 bottom-0 mix-blend-multiply\" ><img src=\"http://iot.ir/images/bg-festival-tablet (1).png\" alt=\"bg-festival-tablet(1)\" style=\"z-index: -1;\" class=\"absolute rotate-180 top-[50%] right-[15%] mix-blend-multiply\" ><div id=\"wrapper_products\" class=\"flex flex-row-reverse gap-[2%] mt-24 flex-wrap w-full items-center justify-start container\" style=\"row-gap: 20px;\" ><!-- core=\"call\" run=\"atclient\" file=\"productlist-load.inc?term=",{"Params":[{"Column":"load","Member":"search","Source":"value"},{"Column":"()"}]},"\" triggers=\"",{"Params":[{"Column":"load","Member":"search"},{"Column":"(false)"}]},"\" ></basis> -->\n\n        </div></div><!-- core=\"call\" file=\"_footer.html\" method=\"get\" run=\"atclient\" ></basis> -->\n    <basis core=\"call\" file=\"footer.inc\" ></basis><!--><script src=\"http://iot.ir/js/basiscore-2.23.1.js\" ></script><script>\n        const host = {\n            settings: {\n                \"default.call.verb\": \"get\",\n                \"connection.web.callcommand\": \"http://iot.ir/\",\n            }\n        };\n        window.addEventListener(\"load\", (event) => {\n            let params = (new URL(document.location)).searchParams;\n            let term = params.get(\"term\");\n            let catid = params.get(\"catid\");\n            if (term) {\n                text = term;\n                var xhttp = new XMLHttpRequest();\n                xhttp.onreadystatechange = function () {\n                    if (this.readyState == 4 && this.status == 200) {\n                        document.getElementById(\"wrapper_products\").innerHTML = xhttp.responseText\n                        window.scrollTo({\n                            top: 0,\n                            behavior: \"smooth\"\n                        })\n                    }\n                };\n                xhttp.open(\"GET\", \"/productlist-load.inc?term=\" + text, true);\n                xhttp.send();\n            } else if (catid) {\n                text = catid;\n                var xhttp = new XMLHttpRequest();\n                xhttp.onreadystatechange = function () {\n                    if (this.readyState == 4 && this.status == 200) {\n                        document.getElementById(\"wrapper_products\").innerHTML = xhttp.responseText\n                        window.scrollTo({\n                            top: 0,\n                            behavior: \"smooth\"\n                        })\n                    }\n                };\n                xhttp.open(\"GET\", \"/productlist-load.inc?catid=\" + text, true);\n                xhttp.send();\n            }\n        });\n        function redirectSearch() {\n            text = document.querySelector(\"#searchBox\").value\n            var xhttp = new XMLHttpRequest();\n            xhttp.onreadystatechange = function () {\n                if (this.readyState == 4 && this.status == 200) {\n                    document.getElementById(\"wrapper_products\").innerHTML = xhttp.responseText\n                    window.scrollTo({\n                        top: 0,\n                        behavior: \"smooth\"\n                    })\n                }\n            };\n            xhttp.open(\"GET\", \"/productlist-load.inc?term=\" + text, true);\n            xhttp.send();\n            // $bc.setSource(\"load.search\", text);\n        }\n        function pagingFunc(page) {\n            // var page = e.getAttribute(\"data-pageno\")\n            var xhttp = new XMLHttpRequest();\n            xhttp.onreadystatechange = function () {\n                if (this.readyState == 4 && this.status == 200) {\n                    // e.innerHTML = xhttp.responseText\n                    document.getElementById(\"wrapper_products\").innerHTML = xhttp.responseText\n                    window.scrollTo({\n                        top: 0,\n                        behavior: \"smooth\"\n                    })\n                }\n            };\n            xhttp.open(\"GET\", \"/productlist-load.inc?term=",{"Params":[{"Column":"cms","Member":"query","Source":"term"}]},"&catid=",{"Params":[{"Column":"cms","Member":"query","Source":"catid"}]},"&pageno=\" + page, true);\n            xhttp.send();\n        }\n    </script><!--><script src=\"http://iot.ir/js/app.js\" ></script></body><style>\n    [aria-label=\"4 / 4\"] {\n        transform: translateX(1vw) !important;\n    }\n</style></html>"]}]}'
        union all
		select 'cms','il_call',  'true'
        union all
		select 'cms','pagesizeid', NULL
        union all
        select 'cms' , 'pageurl' , NULL        
        union all
		select 'cms' , 'useragent' , 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0'        
        union all
		select 'cms' , 'pageid' , '1449860'
        union all
        select 'cms'  , 'dmnid' , '4449'
		union all
        select 'cms'  , 'domainid' , '4449'
        union all
		select 'cms'  , 'ownerid' , '7631'
        union all
        select 'cms'  , 'link_page' , NULL                
        union all
        select 'cms', 'PhysicalPath', '\\192.168.96.2\b\'
		union all
        select 'cms', 'temppath', '\\192.168.96.2\b\temp\'
		union all
        select 'cms', 'cdn', '//cdn1.basiscore.net/digitalents.ir'
        --select 'cms', 'cdn', case when @saas=0 then @cdn when @saas=1 and @activecache_cdn=1 then @cdn else 'http'+@s+'://'+ @www +  @Domainname end
		union all
		select 'cms', 'agentnumber', '0'
		union all
		select 'cms', 'page_index', NULL
        union all
        --select * from @temp
        --union all
		select 'cms','random',NULL
		union all
		select 'cms', 'defaultpath', '\\192.168.96.2\b\' 
		union all
		select 'webserver', 'index', '1'
		union all
		select 'webserver', 'gzip', 'false'    
		union all
		select 'webserver', 'chunked', 'false'    
		union all
		select 'webserver', 'chunksize', '0'
		union all
		select 'webserver', 'etag', '"OmXi"'
		union all
		select 'webserver', 'lastmodified', 'Sat, 22 Aug 2020 10:35:56 GMT'
		union all
		select 'http', 'Cache-Control', 'public,max-age=522280'
		union all
		--select * from @agentinfo
		--union all
		--select 'webserver', 'cachecontrol', case when @cachecontrol>-1 then 'public,'+'max-age='+@cachecontrol  else @cachecontrol end        
		--union all
		select 'webserver', 'mime', 'text/html; charset=UTF-8'
		union all
		select 'webserver', 'headercode', '200 Ok'    
		union all
		select 'webserver', 'filepath', 'D:\Programming\Falsafi\Node\WebServer\wwwroot\main.js'
		union all
		select 'webserver', 'id', '1449860'  
		union all
		select 'webserver', 'domain', 'digitalents.ir'
		union all
		select 'webserver', 'FileContent', NULL    
		union all
		select 'webserver', 'cookie', NULL 
		union all
		select 'webserver', 'debug', 'false'
		union all
        select 'index4' , 'source' , NULL 
		union all
        select 'index4' , 'destination' , NULL    
		union all
		select 'index4' , 'properties' , '{"deform":true}'
		union all
        select 'index4' , 'size' , NULL 		   
		union all
		select 'index4' , 'zippath' , NULL   
		union all 
		------------------Edited by MJ - 97-09-13 ---------------------------------------------------------------
		--select 'cms','showcmserror',case when @debug=1 then 'true' else 'false' end
		select 'cms','showcmserror','true'
		union all 
		---------------------Added By MJ - 97-08-27 -------------------------------
		select 'http','X-XSS-Protection','1; mode=block'
		union all 
		---------------------------------------------------------------------------
		--select 'webserver','savehtml','{"name":"'+convert(nvarchar(50),@idpagecache)+'","path":"'+replace(@defultPath+@cachepath,'\','\\')+'\\cache\\","mime":"'+@mimetype+'"}'
		--select 'webserver','savehtml','{"name":"'+convert(nvarchar(50),@idpagecache)+'","path":"'+replace(@defultPath+@cachepath,'\','\\')+case when @usesitesize='true' then '\\cache\\'+convert(varchar(10),@domainsizeid)+'\\' else '\\cache\\' end+'","mime":"'+@mimetype+'"}'
		select 'webserver','savehtml', NULL
		union all 
		select 'webserver','export',''
		
		
		




		end

DROP PROCEDURE IF EXISTS cms;
DELIMITER //
CREATE PROCEDURE cms()
BEGIN
    SELECT * from temp_table
    union all
	select 'http','Expires', 'max-age=522280,public'
	union all
	select 'http','date',  NOW()
	union all
	select 'http', 'Server', 'BasisCore 4.0.1' 
	union all
	select 'cms','content', ''
	union all
	select 'cms','page_il', '{"$type":"group","core":"group","name":"ROOT_GROUP","Commands":[{"$type":"inlinesource","core":"inlinesource","name":"basisName","Members":[{"name":"memberName","content":"\r\n <row fieldName1=\"test1\" fieldName2=\"1-2\" fieldName3=\"fieldName3-1\" />\r\n <row fieldName1=\"test2\" fieldName2=\"2-2\" fieldName3=\"fieldName3-2\" />\r\n <row fieldName1=\"test3\" fieldName2=\"3-2\" fieldName3=\"fieldName3-3\" />\r\n <row fieldName1=\"test4\" fieldName2=\"4-2\" fieldName3=\"fieldName3-4\" />\r\n <row fieldName1=\"test5\" fieldName2=\"5-2\" fieldName3=\"fieldName3-5\" />\r\n "}]},{"$type":"print","core":"print","data-member-name":"basisName.memberName","layout-content":"\r\n <ul>\r\n @child\r\n </ul>\r\n ","faces":[{"content":"\r\n <li> @fieldName1 (@fieldName2) - (@fieldName3) </li>\r\n "}]}]}'
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
	select 'cms', 'PhysicalPath', '\\\\192.168.96.2\\b\\'
	union all
	select 'cms', 'temppath', '\\\\192.168.96.2\\b\\temp\\'
	union all
	select 'cms', 'cdn', '//cdn1.basiscore.net/digitalents.ir'
	union all
	select 'cms', 'agentnumber', '0'
	union all
	select 'cms', 'page_index', NULL
	union all
	select 'cms','random',NULL
	union all
	select 'cms', 'defaultpath', '\\\\192.168.96.2\\b\\' 
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
	select 'http', 'Cache-Control', 'public,max-age=522280' ;
END  //
DELIMITER ;
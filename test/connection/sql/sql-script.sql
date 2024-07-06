/****** Object:  UserDefinedTableType [dbo].[DBSourceParamCollection]    Script Date: 11/19/2023 23:53:32 ******/
CREATE TYPE [dbo].[DBSourceParamCollection] AS TABLE(
	[ParamType] [varchar](50) NOT NULL,
	[ParamName] [varchar](100) NOT NULL,
	[ParamValue] [nvarchar](max) NULL
)
GO
-------------------------------------------------------------------------------------------------------
--the new version for cms 2-9-93 s.e.a
-------------------------------------------------------------------------------------------------------
 
CREATE PROCEDURE [dbo].[cms]
        @params DBSourceParamCollection READONLY
AS
begin

        select * from @params
		union all
        select 'http','Expires', 'max-age=522280,public'
		union all
		select 'http','date',  dbo.BUFFER_DATE (getdate())
        union all
		select 'http', 'Server', 'BasisCore 4.0.1' 
		--union all
		--select 'http', 'Set-Cookie', 'flavor=choco; SameSite=None; Secure' 
        union all
        select 'cms','content', ''
        union all
		select 'cms','page_il', ''
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

--------------------------------------------------------------------------------------------
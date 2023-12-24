alter PROCEDURE [dbo].[SbCallProcedure]
	
	 @fileNames nvarchar(200), 
	 @dmnid int ,
	 @sitesize int,
	 @command xml

AS
BEGIN

declare @page_il nvarchar(max)
if @fileNames = 'simple.inc'
	set @page_il = '{"$type": "rawtext","content": "<h1>hi<h1>"}';
else if @fileNames = 'deep.inc'
begin
	set @page_il = '{"$type": "call","core": "call","FileName": "source.inc"}';
end
else if @fileNames = 'source.inc'
begin
	set @page_il = '{   "$type": "inlinesource",      "core": "inlinesource",      "name": "view",      "Members": [        {          "name": "menu",          "preview": "true",          "content": "<row name=''Home'' id=''01'' parentid=''00'' />          <row name=''Irantour'' id=''02'' parentid=''00'' />          <row name=''HotelReservation'' id=''03'' parentid=''00'' />          <row name=''Gallery'' id=''04'' parentid=''00'' />          <row name=''AboutUs'' id =''05'' parentid=''00'' />          <row name=''c…0'' />          <row name=''KhorasanJonoobi'' id=''24'' parentid=''20'' />          <row name=''Mashahad'' id=''25'' parentid=''22'' />          <row name=''Neyshbur'' id=''26'' parentid=''22'' />          <row name=''Hotels'' id=''27'' parentid=''03'' />          <row name=''ReservationForm'' id=''28'' parentid=''3'' />          <row name=''Iran'' id=''29'' parentid=''04'' />          <row name=''OurTours'' id=''30'' parentid=''04'' />          <row name=''VideoClips'' id=''31'' parentid=''04'' />"        }      ]    }';
end
select 
@fileNames as 'filename',
'<h1>hi</h1>' as content,
@page_il as page_il,
0 as pagesizeid,
12 as pageid,
case when isnull(@page_il,'')='' then 1 else 0 end as il_call 

END



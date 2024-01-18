var g_NameFilter = "";
var g_TagFilter = [];

function filterName(event)
{
    g_NameFilter = event.srcElement.value;

    refreshFilter();
}

function filterTag(event)
{
    let searchVal = [];
    let allTags = document.getElementsByName("tags");
    for( tag of allTags )
    {
        if( tag.checked )
            searchVal.push(tag);
    }

    g_TagFilter = searchVal;

    refreshFilter();
}

function elementsWithValidTag( elements, tagList )
{
    let ret = [];
    for( blog_item of elements )
    {
        let tags = blog_item.dataset.tags.split(",");

        let tagsMatch = false;
        if( tagList.length == 0 )
        {
            tagsMatch = true;
        }
        else
        {
            for( targetTag of tagList )
            {
                if( tags.includes(targetTag.value) )
                {
                    tagsMatch = true;
                    break;
                }
            }
        }

        if( tagsMatch )
            ret.push(blog_item);
    }

    return ret;
}

function elementsWithValidName( elements, name )
{
    let ret = [];

    for( blog_item of elements )
    {
        if( blog_item.dataset.title.toLowerCase().includes(name.toLowerCase()) )
            ret.push(blog_item);
    }

    return ret;
}

function refreshFilter()
{
    for( blog_preview of document.getElementsByClassName("blog_previews") )
    {
            let filteredElements = elementsWithValidTag(
                blog_preview.getElementsByClassName("blog_preview_item"),
                g_TagFilter
                );

            filteredElements = elementsWithValidName(filteredElements, g_NameFilter);

            for( let blog_item of blog_preview.getElementsByClassName("blog_preview_item") )
            {
                 blog_item.style.display = "none";
            }

            for( let blog_item of filteredElements )
            {
                blog_item.style.display = "";
                console.log(blog_item);
            }
    }
}
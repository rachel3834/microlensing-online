from django.shortcuts import render
from .models import *
from django.views.generic.detail import DetailView

def home(request):
    return render(request,'tutorial/index.html',{})

def tutorial(request,pk=None):
    tutorial_list = TutorialPage.objects.all()
    indices = []
    tutorials = []
    for page in tutorial_list:
        if page.course_index != 0:
            indices.append(page.course_index)
            tutorials.append(page)
    course_index = zip(indices,tutorials)
    course_index.sort()
    (indices, tutorials) = zip(*course_index)
    if pk == None:
        page = TutorialPage.objects.get(course_index=0)
    else:
        page = TutorialPage.objects.get(pk=pk)
        
    page,content = get_article_db_entries(page)
    
    return render(request,'tutorial/article_base.html',\
                {'article_list':tutorials, 'page':page,\
                    'content':content})

def article(request,resource_type,pk=None):
    if resource_type == 'concept':
        article_list = ConceptPage.objects.all()
    else:
        article_list = TutorialPage.objects.all()
    indices = []
    articles = []
    for page in article_list:
        indices.append(page.course_index)
        articles.append(page)
    course_index = zip(indices,articles)
    course_index.sort()
    (indices, articles) = zip(*course_index)
    if pk == None:
        if resource_type == 'concept':
            page = ConceptPage.objects.get(course_index=0)
        else:
            page = TutorialPage.objects.get(course_index=0)
    else:
        if resource_type == 'concept':
            page = ConceptPage.objects.get(pk=pk)
        else:
            page = TutorialPage.objects.get(pk=pk)
    
    page,content,references = get_article_db_entries(page)
    
    return render(request,'tutorial/article_base.html',\
                    {'article_list':articles, 'page':page,\
                    'content':content,'resource_type':resource_type,\
                    'references':references})

def get_article_db_entries(page):
            
    tables = {'REF': Reference, 'URL': OnlineResource, \
                'MOVIE': Movie, 'PICTURE': Picture }
    text = []
    dbentries = []
    references = []
    lines = page.text
    lines = lines.split('\n')
    for line in lines:
        text.append( line )
        if 'DBENTRY' in line:
            l = line.replace('\n','').split(' ')
            idb = l[0]
            table = l[1]
            pk = int(l[2])
            entry = {}
            if table == 'REF':
                entry['type'] = 'REF'
                entry['object'] = Reference.objects.get(pk=pk)
                references.append(entry['object'])
            elif table == 'URL':
                entry['type'] = 'URL'
                entry['object'] = OnlineResource.objects.get(pk=pk)
            elif table == 'MOVIE':
                entry['type'] = 'MOVIE'
                entry['object'] = Movie.objects.get(pk=pk)
            elif table == 'PICTURE':
                entry['type'] = 'PICTURE'
                entry['object'] = Picture.objects.get(pk=pk)
            dbentries.append( entry )
        else:
            dbentries.append( 'no_db_entry' )
    content = zip(text,dbentries)
    
    return page, content, references

def learning(request):
    return render(request,'tutorial/learning.html',{})
    
def overview(request):
    return render(request,'tutorial/overview.html',{})
    
def resources(request):
    return render(request,'tutorial/resources.html',{})

def opportunities(request):
    return render(request,'tutorial/opportunities.html',{})
    
def interactive(request,pk=None):
    tool_list = InteractiveTool.objects.all()
    indices = []
    tools = []
    for page in tool_list:
        if page.tools_index != 0:
            indices.append(page.tools_index)
            tools.append(page)
    index = zip(indices,tools)
    index.sort()
    (indices, tools) = zip(*index)
    if pk == None:
        page = InteractiveTool.objects.get(tools_index=0)
    else:
        page = InteractiveTool.objects.get(pk=pk)
    return render(request,'tutorial/interactive_index.html',\
                {'tool_list':tools, 'page':page})

def page(request):
    page_name = str(request.path_info).replace('/','')
    try:
        page = SitePage.objects.get(name=page_name)
    except SitePage.DoesNotExist:
        page = SitePage.objects.get(name='MissingPage')
    page,content,references = get_article_db_entries(page)
    return render(request,'site/site_page.html',{'page':page,\
                    'content':content,'references':references})

def references(request):
    refs = Reference.objects.all()
    ref_list = []
    for r in refs:
        ref_list.append(r)
    ref_list.sort()
    return render(request,'tutorial/references.html',{'reference_list':ref_list})

def links(request):
    space_surveys = OnlineResource.objects.filter(group__contains='space-based mission')
    ground_surveys = OnlineResource.objects.filter(group__contains='ground-based survey')
    ground_followup = OnlineResource.objects.filter(group__contains='ground-based follow-up')
    
    return render(request,'tutorial/links.html',{'space_surveys':space_surveys, \
                                                'ground_surveys':ground_surveys, \
                                                'ground_followup':ground_followup})

def list_resources(request,resource_type,pk=None):
    
    if resource_type == 'movies':
        resources = Movie.objects.all()
    elif resource_type == 'pictures':
        resources = Picture.objects.all()
    else:
        resources = []
    
    if pk != None:
        if resource_type == 'movies':
            item = Movie.objects.get(pk=pk)
        elif resource_type == 'pictures':
            item = Picture.objects.get(pk=pk)
    else:
        item = None

    title = capitalize_first_letter(resource_type)
    
    return render(request,'tutorial/resource_files.html',{'index':resources, 
                                                          'resource_type':resource_type,
                                                          'resource':item, 
                                                          'title': title})
 
def capitalize_first_letter(s):
    s = s.lstrip()
    s = s[0:1].upper()+s[1:]
    return s
    
class TutorialDetails(DetailView):
    model = TutorialPage
    template_name = 'tutorial/tutorial_page.html'
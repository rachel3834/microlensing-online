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
    return render(request,'tutorial/tutorial_index.html',\
                {'tutorial_list':tutorials, 'page':page})

def concept(request,pk=None):
    concept_list = ConceptPage.objects.all()
    indices = []
    concepts = []
    for page in concept_list:
        if page.course_index != 0:
            indices.append(page.course_index)
            concepts.append(page)
    course_index = zip(indices,concepts)
    course_index.sort()
    (indices, concepts) = zip(*course_index)
    if pk == None:
        page = ConceptPage.objects.get(course_index=0)
    else:
        page = ConceptPage.objects.get(pk=pk)
        
    return render(request,'tutorial/concept_index.html',\
                    {'tutorial_list':concepts, 'page':page})
        
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
    return render(request,'site/site_page.html',{'page':page})

class TutorialDetails(DetailView):
    model = TutorialPage
    template_name = 'tutorial/tutorial_page.html'
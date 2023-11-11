# -*- coding: utf-8 -*-
"""
Created on Fri Mar  3 10:45:14 2017

@author: rstreet
"""

from django import template

register = template.Library()

def columns(resources,ncol):
    """Function to break a single list of resource objects into a list of lists
    where each list entry represents a set of resource objects forming a row in
    a table of ncol columns."""

    columns = []
    row = []
    for r in resources:
        if len(row)+1 > ncol:
            columns.append(row)
            row = []
        row.append(r)
    if len(row) > 0:
        columns.append(row)
    return columns

register.filter(columns)

def _test():

    test_list = range(1,14,1)
    cols = columns(test_list,3)
    print(test_list)
    print(cols)

if __name__ == '__main__':
    _test()

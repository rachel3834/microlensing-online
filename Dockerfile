FROM centos:8

EXPOSE 80
ENTRYPOINT [ "/init" ]

# install packages
RUN yum -y install epel-release\
        && yum -y install nginx python36 supervisor python3-devel\
        && yum -y update\
        && yum -y clean all

# system configuration
COPY docker/ /

# install python requirements
COPY pip-requirements.txt /var/www/microlensingonline/
RUN pip3 install --upgrade pip \
    && pip3 install -r /var/www/microlensingonline/pip-requirements.txt \
    && rm -rf ~/.cache ~/.pip

# copy application
COPY . /var/www/microlensingonline/

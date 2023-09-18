FROM python:3.8
RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
RUN pip install numpy~=1.24.0 scipy pandas matplotlib && pip cache purge
COPY ./packages /packages 
RUN pip install /packages/*.whl && pip cache purge
COPY viewer /root/app/viewer
COPY *.py /root/app
COPY services /root/app/services
COPY safety_cases.db /root/app/safety_cases.db
WORKDIR /root/app
CMD ["python", "app.py"]
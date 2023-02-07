docker run -it  -p 80:80 -p 443:443 -v $(pwd)/conf/nginx.conf:/etc/nginx/nginx.conf \
 nginx bash

 #  \
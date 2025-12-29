#FROM zabor/ng-base-image:latest as baseimg
FROM 697481710535.dkr.ecr.us-east-1.amazonaws.com/zabor/ng-base-image:latest as baseimg

LABEL maintainer="Umar Ali Khan <uak282006@gmail.com>"

RUN echo "vm.overcommit_memory = 1" >> /etc/sysctl.conf

RUN mkdir -p /var/run/sshd-local && mkdir -p /run/sshd  \
    && chmod 0755 /var/run/sshd-local && chmod 0755 /run/sshd \
    && cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak \
    && echo -e "\n\n# Custom configuration added by Dockerfile\n" >> /etc/ssh/sshd_config \
    #&& echo "Subsystem sftp /usr/lib/sftp-server" >> /etc/ssh/sshd_config \
    && echo "AddressFamily inet" >> /etc/ssh/sshd_config \
    && echo "PubkeyAuthentication no" >> /etc/ssh/sshd_config \
    && echo "KbdInteractiveAuthentication no" >> /etc/ssh/sshd_config \
    && echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config \
    && echo "PermitEmptyPasswords no" >> /etc/ssh/sshd_config \
    && echo "Match group nginx" >> /etc/ssh/sshd_config \
    && echo "#AllowUsers lprFtp01" >> /etc/ssh/sshd_config \
    && echo "#AllowGroups ssh-users nginx" >> /etc/ssh/sshd_config \
    && echo "#DenyUsers *" >> /etc/ssh/sshd_config \
    && echo "#ChrootDirectory /app/site" >> /etc/ssh/sshd_config \
    && echo "#ChrootDirectory %h" >> /etc/ssh/sshd_config \
    && echo "X11Forwarding no" >> /etc/ssh/sshd_config \
    && echo "AllowTcpForwarding no" >> /etc/ssh/sshd_config \
    && echo "ForceCommand internal-sftp" >> /etc/ssh/sshd_config \
    && echo "#ForceCommand sftp-server" >> /etc/ssh/sshd_config \
    && echo -e "\nMatch User zaborAppFtp01" >> /etc/ssh/sshd_config \
    && echo -e "\tChrootDirectory /app/site" >> /etc/ssh/sshd_config \
    && echo -e "\tForceCommand internal-sftp" >> /etc/ssh/sshd_config \
    && echo -e "\n# End of custom configuration added by Dockerfile" >> /etc/ssh/sshd_config \
    #&& sed -i -r "s/(^Subsystem.*)/#\1/" /etc/ssh/sshd_config \
    #&& sed -i -r "s/(^UsePAM yes.*)/#\1/" /etc/ssh/sshd_config \
    #&& sed -i -r "s/^#(UsePAM yes.*)/\1/" /etc/ssh/sshd_config \
    #&& sed -i -r "s/^#(SyslogFacility AUTH.*)/\1/" /etc/ssh/sshd_config \
    #&& sed -i -r "s/^#(LogLevel INFO.*)/\1/" /etc/ssh/sshd_config \
    #&& sed -i -r "s/^#(LogLevel INFO.*)/LogLevel DEBUG/" /etc/ssh/sshd_config \
    && echo -e "\n\n" >> /etc/ssh/sshd_config

RUN ssh-keygen -A && touch /var/log/btmp && chmod 0600 /var/log/btmp

COPY ./docker-files/production/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./docker-files/production/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY ./docker-files/production/nginx/options-ssl-nginx.conf /etc/nginx/options-ssl-nginx.conf
COPY ./docker-files/production/nginx/proxy_params /etc/nginx/proxy_params

RUN mkdir -p /app
COPY ./docker-files/production/entrypoint.sh /app
COPY ./scripts/linux/reload.sh /app
COPY ./scripts/letsencrypt.tar.zstd /app
COPY ./scripts/linux/letsencrypt-fix.sh /app
COPY ./scripts/linux/letsencrypt-renew.sh /app

# Set working directory to ...
WORKDIR /app

COPY ./docker-files/production/entrypoint.sh /opt/entrypoint.sh
RUN chmod +x /opt/entrypoint.sh

# Copy files from current folder to container current folder (set in workdir).
COPY --chown=nginx:nginx ./site/dist/production /app/site/zabor-app

# Make the entrypoint file and other scripts executable
RUN chmod +x ./entrypoint.sh ./reload.sh ./letsencrypt-fix.sh ./letsencrypt-renew.sh && true

# custom aliases
RUN echo '' >> ~/.profile \
    && echo 'alias pl="netstat -tulpn"'>> ~/.profile \
    && echo 'alias site="cd /app/site/zabor-app && pwd"' >> ~/.profile \
    && echo 'alias home="cd /app && pwd"' >> ~/.profile \
    && echo 'alias reload="/app/reload.sh"' >> ~/.profile \
    && true

# Expose web port 80
EXPOSE 80

# Expose web port 443 for https
EXPOSE 443

# Expose sftp port 22
EXPOSE 22

# Expose range of ports for ftp connections
#EXPOSE 6100-6200

# Define the entrypoint
ENTRYPOINT [ "./entrypoint.sh" ]

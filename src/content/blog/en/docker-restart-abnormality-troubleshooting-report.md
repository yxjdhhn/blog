---
title: >-
  Docker Stuck on Loading Containers After Restart: A firewalld Blocking
  Investigation
description: >-
  A record of troubleshooting why Docker failed to start properly via systemd
  after a server reboot, tracing from residual network references to dockerd's
  libnetwork initialization being blocked by firewalld's D-Bus call.
pubDate: '2026-05-12'
tags:
  - Docker
  - systemd
  - firewalld
  - D-Bus
  - Troubleshooting
category: Technology
heroImage: >-
  ../../../assets/blog/generated/docker-restart-abnormality-troubleshooting-report.svg
draft: false
generatedFrom: zh
sourceHash: 9c3fdab668804d8ca40b1f06204b08ff8637bf34a2c6141c6f70fdb124bc00a6
translationStatus: complete
imageStatus: pending
---
After the server reboot, the Docker Compose services under `/home/ac/ui/auth` did not automatically recover.

At first, this incident appeared to be a Docker startup anomaly, but later it was revealed that old containers were referencing a non-existent Docker network. After cleaning up the remnants, the services could be temporarily restored by manually starting `dockerd`. However, once switched back to systemd management, Docker still hung at `Loading containers: start.`.

Ultimately, the goroutine stack of `dockerd` confirmed that the real blocker in the systemd startup chain was:

```text
dockerd -> libnetwork -> iptables -> firewalld -> D-Bus
```

<div class="article-callout">
  <p class="article-kicker">Final Diagnosis</p>
  <p>This was not caused by disk, inode, overlay2, or common containerd directory remnants. The core issue was that Docker 18.06.3-ce, when initializing the network, called firewalld's D-Bus interface, which did not return for an extended period, preventing the daemon from completing its startup.</p>
</div>

## 现场现象：Docker API 不可用

业务容器是：

```text
common-authentication-frontend
```

使用的镜像是：

```text
nginx:1.25
```

容器预期监听端口为：

```text
0.0.0.0:80->80/tcp
0.0.0.0:443->443/tcp
```

服务器重启后，在业务目录执行：

```bash
docker-compose up -d
```

直接报错：

```text
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```

查看 Docker 服务状态：

```bash
sudo systemctl status docker --no-pager -l
```

一开始看到 Docker 长时间停在：

```text
Active: deactivating (stop-sigterm)
```

后续再次通过 systemd 启动，又长期停在：

```text
Active: activating (start)
Loading containers: start.
```

这个阶段 `dockerd` 和 `docker-containerd` 进程都存在，但 Docker API 不可用。下面两个命令都会卡住：

```bash
sudo docker version
sudo docker info
```

## 第一层问题：旧容器引用了缺失的 network

为了绕开 systemd，先手动前台启动 Docker：

```bash
sudo dockerd --debug
```

这时可以看到 Docker daemon 能完成一部分初始化，但加载旧容器时出现网络引用异常：

```text
Failed to start container 82dc0b19b9d6...: network e7b97d72f2ca... not found
```

这说明 Docker 的旧容器元数据还引用着一个已经不存在的 network。

先清理残留容器和 Compose 网络：

```bash
sudo docker container prune -f
sudo docker network prune -f
sudo docker system prune -f
sudo docker stop common-authentication-frontend 2>/dev/null
sudo docker rm common-authentication-frontend 2>/dev/null
sudo docker network rm auth_default 2>/dev/null
```

然后临时用手动后台方式启动 Docker：

```bash
sudo dockerd > /tmp/dockerd.log 2>&1 &
```

再重新拉起业务：

```bash
sudo docker-compose up -d
sudo docker-compose ps
```

业务容器成功恢复：

```text
common-authentication-frontend   nginx:1.25   Up   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

到这里可以确定：**业务可以通过手动 `dockerd` 临时恢复，旧容器和旧网络引用也确实参与了第一阶段故障。**

## Second Layer Problem: systemd Managed Startup Still Fails

After temporarily restoring the service, Docker still needed to be switched back to systemd management; otherwise, there would be no reliable automatic recovery capability after the next server reboot.

Checking the processes at that time:

```bash
sudo ps aux | grep -E "dockerd|containerd" | grep -v grep
```

Revealed a manually started chain:

```text
sudo dockerd
dockerd
docker-containerd
docker-containerd-shim
```

While the Docker service status in systemd was:

```text
Active: failed
Loaded: loaded (/etc/systemd/system/docker.service; disabled)
```

So the service was stopped, manual processes and sockets were cleaned up, and an attempt was made to restore systemd management:

```bash
sudo docker-compose down
sudo pkill dockerd
sudo pkill containerd
sudo rm -f /var/run/docker.pid /var/run/docker.sock
sudo rm -f /run/docker.pid /run/docker.sock
sudo systemctl reset-failed docker
sudo systemctl daemon-reload
sudo systemctl enable docker
sudo systemctl start docker
```

But `systemctl start docker` got stuck again:

```text
Active: activating (start)
Loading containers: start.
```

This indicated that after clearing the leftover old containers and networks from the first layer, there was another blocking point in the systemd startup chain.

## Directions Excluded

To avoid misdiagnosis, several common causes were ruled out first.

### Disk Space and Inodes

Check disk space and inodes:

```bash
df -h
df -i
```

The results show that both the root partition and inode usage are very low, so the issue is not due to exhausted disk space or inodes.

### Container Directory Residue

Check the Docker container directory:

```bash
sudo ls -la /var/lib/docker/containers
```

The directory is already empty:

```text
total 0
drwx------.  2 root root   6 May 11 18:40 .
drwx--x--x. 15 root root 200 May 11 18:46 ..
```

### Docker Network Local Database

Also cleaned the local state of Docker network:

```bash
sudo rm -f /var/lib/docker/network/files/local-kv.db
sudo rm -rf /run/docker/libnetwork
sudo rm -rf /var/run/docker/libnetwork
```

Then verify:

```bash
sudo find /var/lib/docker/network -maxdepth 3 -type f -o -type d
```

Only the base directories remain:

```text
/var/lib/docker/network
/var/lib/docker/network/files
```

### Docker Mount Residuals

Check mounts:

```bash
mount | grep docker
```

No output, indicating no Docker mount residuals.

### containerd Runtime Directory

I also backed up and cleaned the containerd-related directories:

```bash
sudo mv /var/lib/docker/containerd /var/lib/docker/containerd.bak.20260511191905
sudo rm -rf /var/run/docker/containerd
sudo rm -rf /run/docker/containerd
```

But Docker still got stuck during systemd startup at:

```text
Loading containers: start.
```

So the issue was not caused by residual files in the regular containerd runtime directory.

## Key Evidence: dockerd Stuck on firewalld's D-Bus Call

When Docker hangs, send the `USR1` signal to `dockerd`:

```bash
sudo kill -USR1 <dockerd_pid>
```

Docker generates a goroutine stack file:

```text
/var/run/docker/goroutine-stacks-2026-05-11T193633+0800.log
```

View the main goroutine stack:

```bash
sudo head -n 220 /var/run/docker/goroutine-stacks-2026-05-11T193633+0800.log
```

Key content:

```text
goroutine 1 [chan receive, 16 minutes]:
github.com/docker/docker/vendor/github.com/godbus/dbus.(*Object).Call
github.com/docker/docker/vendor/github.com/docker/libnetwork/iptables.checkRunning
github.com/docker/docker/vendor/github.com/docker/libnetwork/iptables.FirewalldInit
github.com/docker/docker/vendor/github.com/docker/libnetwork/iptables.initFirewalld
github.com/docker/docker/vendor/github.com/docker/libnetwork/iptables.initDependencies
github.com/docker/docker/vendor/github.com/docker/libnetwork/drivers/bridge.removeIPChains
github.com/docker/docker/vendor/github.com/docker/libnetwork/drivers/bridge.(*driver).configure
github.com/docker/docker/vendor/github.com/docker/libnetwork/drivers/bridge.Init
github.com/docker/docker/vendor/github.com/docker/libnetwork.New
github.com/docker/docker/daemon.(*Daemon).initNetworkController
github.com/docker/docker/daemon.(*Daemon).restore
github.com/docker/docker/daemon.NewDaemon
main.(*DaemonCli).start
```

This stack trace points to the Docker network controller initialization process.

More specifically, when `dockerd` initializes `libnetwork`, `bridge`, and `iptables`, it queries the `firewalld` status via D-Bus. This call never returns, preventing the Docker daemon from completing initialization, so systemd keeps seeing the service in a starting state.

## Root Cause Analysis

This issue can be broken down into two layers.

The first layer occurs when Docker attempts to automatically restore old containers after a server restart, encountering a missing network:

```text
network e7b97d72... not found
```

This layer can be bypassed by cleaning up old containers, old networks, and Compose networks.

The second layer arises when switching back to systemd management, where Docker still gets stuck during startup. The final diagnosis is:

```text
Docker 18.06.3-ce, during libnetwork/iptables initialization, makes a D-Bus call to firewalld that blocks indefinitely, causing dockerd to hang at Loading containers: start.
```

Therefore, the core issue behind the subsequent systemd startup failure is not container directories, image layers, overlay2, containerd, or disk space—but rather the blocking between `firewalld` and Docker's network initialization chain.

## Temporary Business Recovery Plan

Since continuing to fix the systemd/firewalld chain would prolong recovery time, we chose to revert to manual deployment to restore services.

The steps are as follows:

```bash
sudo systemctl kill --kill-who=all --signal=SIGKILL docker
sudo pkill -9 dockerd 2>/dev/null
sudo pkill -9 containerd 2>/dev/null
sudo pkill -9 containerd-shim 2>/dev/null

sudo systemctl stop firewalld

sudo rm -f /var/run/docker.pid /var/run/docker.sock
sudo rm -f /run/docker.pid /run/docker.sock
sudo rm -rf /var/run/docker/containerd
sudo rm -rf /run/docker/containerd

sudo dockerd > /tmp/dockerd.log 2>&1 &
sleep 10

sudo docker version
sudo docker ps -a
sudo docker network ls

cd /home/ac/ui/auth
sudo docker-compose up -d
sudo docker-compose ps
```

The expected result is that containers return to the `Up` state:

```text
common-authentication-frontend   Up   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

## Temporary systemd Configuration Change

During troubleshooting, to prevent systemd from automatically restarting `dockerd` after forcefully killing it and causing it to hang again, a temporary drop-in was added:

```text
/etc/systemd/system/docker.service.d/no-restart.conf
```

With the following content:

```ini
[Service]
Restart=no
```

This configuration overrides the original Docker service setting:

```ini
Restart=always
```

If you continue to start Docker manually, you can keep this file temporarily to avoid systemd interfering with the temporary recovery.

To restore systemd management later, delete this temporary override:

```bash
sudo rm -f /etc/systemd/system/docker.service.d/no-restart.conf
sudo systemctl daemon-reload
sudo systemctl show docker -p Restart
```

The expected output should revert to:

```text
Restart=always
```

## 后续彻底修复思路

后续如果要恢复服务器重启后的自动拉起能力，建议在业务低峰期专项处理 `firewalld`、D-Bus 与 Docker 的兼容问题。

先检查 D-Bus 和 firewalld 状态：

```bash
sudo systemctl status dbus --no-pager -l
sudo systemctl status firewalld --no-pager -l
sudo busctl list | grep -i firewalld
sudo firewall-cmd --state
```

再在停机窗口测试停用 firewalld 后，systemd 是否可以正常启动 Docker：

```bash
sudo systemctl stop firewalld
sudo systemctl restart docker
sudo systemctl status docker --no-pager -l
sudo docker version
```

如果停用 `firewalld` 后 Docker 能正常启动，问题就基本集中在 `firewalld` 与 D-Bus 集成上。

后续可以重点评估三件事：

1. **修复或禁用 firewalld 链路**：确认 `firewalld` 和 D-Bus 状态是否正常，必要时在维护窗口内禁用 `firewalld`，改用明确的 `iptables` 规则管理。
2. **升级 Docker**：当前版本是 `Docker 18.06.3-ce`，版本较老，`libnetwork` 与 `firewalld` 相关兼容问题风险更高。
3. **恢复 systemd 托管前做完整验证**：确认 Docker 服务、Docker API、网络列表和业务容器都能稳定返回。

恢复 systemd 托管前，可以按下面顺序确认：

```bash
sudo systemctl start docker
sudo systemctl status docker --no-pager -l
sudo docker version
sudo docker ps -a
sudo docker network ls
```

确认 Docker 正常后，再恢复自启：

```bash
sudo rm -f /etc/systemd/system/docker.service.d/no-restart.conf
sudo systemctl daemon-reload
sudo systemctl reset-failed docker
sudo systemctl enable docker
sudo systemctl restart docker
```

最后验证业务：

```bash
cd /home/ac/ui/auth
sudo docker-compose up -d
sudo docker-compose ps
curl -I http://127.0.0.1
curl -k -I https://127.0.0.1
```

## Summary

The key to this investigation was not a single cleanup command, but distinguishing between two distinct phases of the problem:

1. After the server reboot, old container metadata referenced Docker networks that no longer existed, causing automatic recovery to fail.
2. After cleaning up the remnants, systemd still hung when starting Docker. The issue was ultimately traced via goroutine stack to `dockerd` blocking on a D-Bus call to `firewalld` during `libnetwork/iptables` initialization.

When online services need to be restored first, manually starting `dockerd` serves as a temporary workaround. However, to truly resolve automatic recovery after reboot, the root cause lies in the compatibility chain among `firewalld`, D-Bus, and the Docker version.

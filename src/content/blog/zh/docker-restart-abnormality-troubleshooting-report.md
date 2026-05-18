---
title: Docker 重启后卡在 Loading containers：一次 firewalld 阻塞排查
description: 记录一次服务器重启后 Docker 无法由 systemd 正常拉起的排查过程，从残留网络引用一路定位到 dockerd 初始化 libnetwork 时被 firewalld 的 D-Bus 调用阻塞。
pubDate: '2026-05-12'
tags:
  - Docker
  - systemd
  - firewalld
  - D-Bus
  - 故障排查
category: 技术
---

服务器重启后，`/home/ac/ui/auth` 下的 Docker Compose 服务没有自动恢复。

这次故障一开始看起来像 Docker 自身启动异常，后来又暴露出旧容器引用了不存在的 Docker network。清理残留后，业务虽然可以通过手动 `dockerd` 临时恢复，但一旦切回 systemd 托管，Docker 仍然卡在 `Loading containers: start.`。

最后通过 `dockerd` 的 goroutine 堆栈确认，真正阻塞 systemd 启动链路的是：

```text
dockerd -> libnetwork -> iptables -> firewalld -> D-Bus
```

<div class="article-callout">
  <p class="article-kicker">最终判断</p>
  <p>这不是磁盘、inode、overlay2 或普通 containerd 目录残留导致的问题。核心原因是 Docker 18.06.3-ce 初始化网络时调用 firewalld 的 D-Bus 接口长期不返回，导致 daemon 无法完成启动。</p>
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

## 第二层问题：systemd 托管仍然启动失败

临时恢复业务后，还需要把 Docker 切回 systemd 托管，否则下次服务器重启后仍然没有可靠的自动恢复能力。

当时查看进程：

```bash
sudo ps aux | grep -E "dockerd|containerd" | grep -v grep
```

可以看到存在手动启动链路：

```text
sudo dockerd
dockerd
docker-containerd
docker-containerd-shim
```

而 systemd 中的 Docker 服务状态是：

```text
Active: failed
Loaded: loaded (/etc/systemd/system/docker.service; disabled)
```

于是停止业务、清理手动进程和 socket，再尝试恢复 systemd 托管：

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

结果 `systemctl start docker` 再次卡住：

```text
Active: activating (start)
Loading containers: start.
```

这说明第一层的旧容器和旧网络残留清掉以后，systemd 启动链路里还有另一个阻塞点。

## 排除过的方向

为了避免误判，先排除了几个常见原因。

### 磁盘空间和 inode

检查磁盘空间与 inode：

```bash
df -h
df -i
```

结果显示根分区和 inode 使用率都很低，因此不是磁盘空间或 inode 耗尽。

### 容器目录残留

检查 Docker 容器目录：

```bash
sudo ls -la /var/lib/docker/containers
```

结果目录已经为空：

```text
total 0
drwx------.  2 root root   6 May 11 18:40 .
drwx--x--x. 15 root root 200 May 11 18:46 ..
```

### Docker network 本地数据库

也清理过 Docker network 的本地状态：

```bash
sudo rm -f /var/lib/docker/network/files/local-kv.db
sudo rm -rf /run/docker/libnetwork
sudo rm -rf /var/run/docker/libnetwork
```

再检查：

```bash
sudo find /var/lib/docker/network -maxdepth 3 -type f -o -type d
```

仅剩基础目录：

```text
/var/lib/docker/network
/var/lib/docker/network/files
```

### Docker 挂载残留

检查挂载：

```bash
mount | grep docker
```

没有输出，说明没有 Docker mount 残留。

### containerd 运行时目录

还曾备份并清理 containerd 相关目录：

```bash
sudo mv /var/lib/docker/containerd /var/lib/docker/containerd.bak.20260511191905
sudo rm -rf /var/run/docker/containerd
sudo rm -rf /run/docker/containerd
```

但 systemd 启动 Docker 仍然卡在：

```text
Loading containers: start.
```

所以问题不在普通的 containerd 运行时目录残留。

## 关键证据：dockerd 卡在 firewalld 的 D-Bus 调用

当 Docker 卡住时，向 `dockerd` 发送 `USR1` 信号：

```bash
sudo kill -USR1 <dockerd_pid>
```

Docker 会生成 goroutine 堆栈文件：

```text
/var/run/docker/goroutine-stacks-2026-05-11T193633+0800.log
```

查看主协程堆栈：

```bash
sudo head -n 220 /var/run/docker/goroutine-stacks-2026-05-11T193633+0800.log
```

关键内容如下：

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

这段堆栈把问题指向了 Docker 初始化网络控制器的过程。

更具体地说，`dockerd` 在初始化 `libnetwork`、`bridge` 和 `iptables` 时，会通过 D-Bus 查询 `firewalld` 状态。这个调用没有返回，导致 Docker daemon 无法完成初始化，systemd 也就一直看到服务处于启动中。

## 根因判断

这次问题分成两个层次。

第一层是服务器重启后，Docker 自动恢复旧容器时遇到缺失的 network：

```text
network e7b97d72... not found
```

这一层通过清理旧容器、旧 network 和 Compose 网络后可以绕过去。

第二层是切回 systemd 托管时，Docker 仍然卡在启动阶段。最终定位为：

```text
Docker 18.06.3-ce 在初始化 libnetwork/iptables 时通过 D-Bus 调用 firewalld，调用长期阻塞，导致 dockerd 卡在 Loading containers: start.
```

所以后续 systemd 启动失败的核心问题不是容器目录、镜像层、overlay2、containerd，也不是磁盘空间，而是 `firewalld` 与 Docker 网络初始化链路之间的阻塞。

## 临时恢复业务的方案

由于继续修复 systemd/firewalld 链路会拉长恢复时间，当时选择先回到手动部署方式恢复业务。

操作步骤如下：

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

预期结果是容器重新处于 `Up` 状态：

```text
common-authentication-frontend   Up   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

## 临时 systemd 配置变更

排查过程中，为了防止 systemd 在强杀 `dockerd` 后自动拉起并再次卡住，临时增加了 drop-in：

```text
/etc/systemd/system/docker.service.d/no-restart.conf
```

内容是：

```ini
[Service]
Restart=no
```

这个配置会覆盖原 Docker service 中的：

```ini
Restart=always
```

如果继续使用手动启动 Docker，可以暂时保留该文件，避免 systemd 干扰临时恢复。

如果后续要恢复 systemd 托管，需要删除这个临时覆盖：

```bash
sudo rm -f /etc/systemd/system/docker.service.d/no-restart.conf
sudo systemctl daemon-reload
sudo systemctl show docker -p Restart
```

期望输出恢复为：

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

## 总结

这次排查的关键不是某一个清理命令，而是区分了两个不同阶段的问题：

1. 服务器重启后，旧容器元数据引用了已经不存在的 Docker network，导致自动恢复失败。
2. 清理残留后，systemd 启动 Docker 仍然卡住，最终通过 goroutine 堆栈定位为 `dockerd` 在初始化 `libnetwork/iptables` 时调用 `firewalld` 的 D-Bus 接口阻塞。

当线上业务需要先恢复时，手动启动 `dockerd` 是一个临时绕行方案。但真正要解决重启后的自动恢复问题，还是要回到 `firewalld`、D-Bus 和 Docker 版本兼容这条链路上处理。

# Doula Manager

Application de gestion de clientèle pour doulas — suivi des mamans, forfaits, rencontres, paiements et calendrier.

**Stack** : Next.js 16 · Prisma · PostgreSQL · Docker

---

## Développement local

```bash
# Démarrer l'app + la base de données
docker-compose up -d

# L'app est accessible sur http://localhost:3000
```

Pour créer le premier utilisateur admin, utiliser le seed :

```bash
docker-compose exec app node prisma/seed.js
```

---

## Build et déploiement sur serveur

### 1. Builder l'image (sur votre machine locale, dans WSL)

```bash
cd /home/alex/doula-manager

docker build -t doula-manager:latest .
```

### 2. Exporter l'image en fichier compressé

```bash
docker save doula-manager:latest | gzip > doula-manager.tar.gz
```

### 3. Transférer sur le serveur

```bash
scp doula-manager.tar.gz user@votre-serveur:/opt/doula/
# Transférer aussi docker-compose.yml si c'est un nouveau serveur
scp docker-compose.yml user@votre-serveur:/opt/doula/
```

### 4. Sur le serveur — charger et lancer

```bash
cd /opt/doula

# Charger l'image
docker load < doula-manager.tar.gz

# Créer le fichier .env (première fois seulement)
cat > .env << 'EOF'
POSTGRES_PASSWORD=motdepasse_fort
DATABASE_URL=postgresql://doula:motdepasse_fort@db:5432/doula_manager?schema=public
NEXTAUTH_SECRET=secret_tres_long_et_aleatoire
NEXTAUTH_URL=https://votre-domaine.com
ADMIN_PASSWORD=motdepasse_admin
EOF

# Lancer
docker-compose up -d
```

### 5. Mises à jour (déploiements suivants)

```bash
# Sur la machine locale : rebuild + reexporter
docker build -t doula-manager:latest . && docker save doula-manager:latest | gzip > doula-manager.tar.gz
scp doula-manager.tar.gz user@votre-serveur:/opt/doula/

# Sur le serveur
cd /opt/doula
docker load < doula-manager.tar.gz
docker-compose up -d --no-build
```

> **⚠️ Important** : Ne jamais copier le `.env` de développement sur le serveur.  
> Générer un `NEXTAUTH_SECRET` fort avec : `openssl rand -base64 32`

---

## Variables d'environnement

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `NEXTAUTH_SECRET` | Clé secrète pour les sessions (minimum 32 chars) |
| `NEXTAUTH_URL` | URL publique de l'application |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL (utilisé par docker-compose) |
| `ADMIN_PASSWORD` | Mot de passe du compte admin créé par le seed |

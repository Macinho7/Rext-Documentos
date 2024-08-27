/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { GertModule } from './gert.module';
import rateLimit from 'express-rate-limit';
import { erroInternoServidor } from './exceptionFilter/exceptions';
import { AppService } from 'apps/rext/src/app.service';
const usuariosParaBan = new Set<string>();
async function bootstrap() {
  const app = await NestFactory.create(GertModule, { cors: true });
  const usuariosS = app.get(AppService);
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 2 * 60 * 1000,
      max: 5,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      keyGenerator: (req, res) => {
        const sep = req.url;
        const id = sep.split('/')[2];
        return id;
      },
      handler: async (req, res) => {
        const sep = req.url;
        console.log(usuariosParaBan);
        const id = sep.split('/')[2];

        const usuario = await usuariosS.usuarioRepository.findOneBy({ id: id });
        if (usuario) {
          if (!usuariosParaBan.has(usuario.id)) {
            usuariosParaBan.add(usuario.id);
            setTimeout(
              () => {
                usuariosParaBan.delete(usuario.id);
              },
              2 * 60 * 1000, //tem que ser igual ao tempo de bloqueio do rate limit
            );
            usuario.bannedcount += 1;
            await usuariosS.usuarioRepository.save(usuario);
            if (usuario.bannedcount > 3) {
              usuario.deleted = true;
              await usuariosS.usuariosBanidos.save(usuario);
              await usuariosS.usuarioRepository.remove(usuario);
            }
          }
        }

        res
          .status(429)
          .send(
            'Ocorreu um problema. Por favor, espere alguns minutos até que você possa enviar os dados novamente.',
          );
      },
      message:
        'Ocorreu um problema. Por favor, espere alguns minutos até que você possa enviar os dados novamente.',
    }),
  );
  app.useGlobalFilters(new erroInternoServidor());
  app.enableCors();

  await app.listen(5000);
}
bootstrap();

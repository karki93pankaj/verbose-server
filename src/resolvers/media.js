import AWS from 'aws-sdk'
import moment from 'moment'
import shortid from 'shortid'
import changeCase from 'change-case'


export default {
  Query: {
    mediaFiles: (parent, args, ctx, info) => {
      // 1. Check if they are logged in
      if (!ctx.req.userId) {
        throw new Error('You must be logged in!');
      }
      // 2. Check if the user has the permissions to query all the users
      // hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);

      return ctx.prisma.medias({ orderBy: 'createdAt_DESC' }, info)
    },
    mediaFile: (parent, args, ctx, info) => {
      return ctx.prisma.media(args, info)
    }
  },
  Mutation: {
    async uploadMedia(parent, { media }, ctx, info) {
      const { createReadStream, filename, mimetype, encoding } = await media;
      const stream = createReadStream()

      if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
        return null
      }
      else {
        AWS.config.update({
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          region: 'ap-southeast-2'
        });

        const date = moment().format('YYYYMMDD')
        const fileName = changeCase.paramCase(filename.substr(0, filename.lastIndexOf('.')))
        const fileExtension = filename.substr(filename.lastIndexOf('.') + 1)
        const s3URL = `${date}/${fileName}-${shortid.generate()}.${fileExtension}`

        const s3 = new AWS.S3()
        
        var params = { Bucket: process.env.AWS_S3_BUCKET, Key: s3URL, Body: stream, ACL: 'public-read', ContentType: mimetype }
        try {
          const result = await s3.upload(params).promise()
          if(result.ETag) {
            const media = await ctx.prisma.createMedia({
              url: `//${process.env.AWS_S3_BUCKET}/${s3URL}`,
            }, info)
            return media
          }
        } catch (e) {
          return null
        }
      }
    },
    async updateMedia(parent, args, ctx, info) {
      const {id, title, altText} = args
      const media = await ctx.prisma.updateMedia({
        data: {
          title,
          altText
        },
        where: { id }
      }, info)

      return media
    }
  }
}

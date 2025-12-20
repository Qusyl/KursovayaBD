using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KursovayaBD.Models
{
    [Table("worker", Schema = "public")]
    public class WorkerModel
    {
        [Key]
        [Required]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("shop")]
        
        public int Shop { get; set; }

        [Column("worker_name")]
        [MaxLength(50)]

        public string WorkerName { get; set; } = string.Empty;
        [Column("worker_surname")]
        [MaxLength(50)]
        public string WorkerSurname { get; set; } = string.Empty;

        [Column("worker_lastname")]
        [MaxLength(50)]
        public string WorkerLastname { get; set; } = string.Empty;

        [Column("phone")]
        [MaxLength(12)]
        public string Phone { get; set; } = string.Empty;

        [Column("avatar", TypeName = "xml")]
        public string Avatar { get; set; } = string.Empty;

       
      

    
    }
}

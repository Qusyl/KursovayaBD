using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KursovayaBD.Models
{
    [Table("product_insert_audit",Schema ="public")]
    public class ProductAuditModel
    {
        [Key]
        [Required]
        [Column("audit_id")]
        public int Id { get; set; }

        [Required]
        [Column("product_id")]
        public int Product { get; set; }

        [Column("changed_at")]
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

        [Column("action")]
        [MaxLength(10)]
        public string Action { get; set; } = string.Empty;

        [Column("old_name")]
        [MaxLength(10)]
        public string? OldName { get; set; } 

        [Column("new_name")]
        [MaxLength(10)]

        public string? NewName { get; set; }

        [Column("old_price")]
        public decimal? OldPrice { get; set; }

        [Column("new_price")]
        public decimal? NewPrice { get; set; }

        [Column("old_producer")]
        [MaxLength(50)]
        public string? OldProducer { get; set; }

        [Column("new_producer")]
        [MaxLength(100)]
        public string? NewProducer { get; set; }

        [Column("old_category")]
        [MaxLength(50)]
        public string? OldCategory { get; set; }

        [Column("new_category")]
        [MaxLength(50)]
        public string? NewCategory { get; set; }


    }
}
